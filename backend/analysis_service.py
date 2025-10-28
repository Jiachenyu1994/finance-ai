from LLM_client import LLMerror, LLMClient
import json
from typing import Optional, Dict, Any,List
import time
import re
import db
import sqlite3

client = LLMClient()

SCHEMA_HINT = """
表: transactions(id TEXT, user_id TEXT, date TEXT[YYYY-MM-DD], merchant TEXT, note TEXT,
     amount_cents INTEGER, category TEXT,predicted_category TEXT,created_at TEXT)
只能读 SELECT,不允许写入/修改/删除。
"""

SQL_PROMPT = """你是SQL助手.根据"用户问题"和"数据库结构",
输出**单条 SQLite 兼容 SQL**.只输出 SQL,不要解释、不要markdown代码块格式化、不要多余文字.
注意事项:
1. 只能使用表: transactions
2. 只能使用 SELECT 语句,禁止使用 INSERT/UPDATE/DELETE 等写入/修改/删除语句
3. 日期格式为 YYYY-MM-DD
4. 必须在 WHERE 子句中包含 user_id = ? 条件
5. ? 是参数占位符，不需要替换成具体值

示例:
问题: 总支出是多少?
SQL: SELECT SUM(amount_cents) as total FROM transactions WHERE user_id = ?

问题: 最近一笔支出是什么?
SQL: SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 1

用户问题: {question}
数据库结构:
{schema_hint}
"""

SUMMARY_SYSTEM = (
    "你是财务数据解读助手。严格基于提供的数据总结要点，"
    "你看到的金额都是cents，需要转换为dollars，不能编造事实。输出简洁英文。"
    "如果没有数据请直接说明“No data found”。"
)

def generate_sql(question: str) -> str:
    prompt= SQL_PROMPT.format(
        question=question,
        schema_hint=SCHEMA_HINT
    )
    llm_response = client.ask_text(
        user_prompt=prompt)
    sql=re.sub(r"<think>.*?</think>", "", llm_response, flags=re.DOTALL).strip()
    print("Generated SQL:", sql)
    # sql = re.sub(r"^```(?:sql)?\s*|\s*```$", "", sql.strip(), flags=re.I).strip()
    # if not re.match(r"^\s*select\b", sql, re.I):
    #     raise ValueError("Generated SQL is not a SELECT statement.")
    
    if re.search(r"\b(drop|delete|update|insert|alter|truncate|attach|pragma)\b", sql, re.I):
        raise ValueError("Unsafe SQL keywords detected.")
    return sql

def execute_sql(sql: str, user_id: str) -> sqlite3.Row:
    conn = db.get_conn()
    try:
        print("Original SQL:", sql)
        print("Parameters:", {"user_id": user_id})
        print("Going to execute with user_id:", user_id)
        cursor = conn.execute(sql, [user_id])
        # 获取列名
        columns = [description[0] for description in cursor.description] if cursor.description else []
        data = cursor.fetchall()
        if data:
            print("Got results:", len(data), "rows")
            print("Columns:", columns)
            print("Data:", data)
            # 将结果转换为字典列表
            result = []
            for row in data:
                row_dict = {}
                for i, value in enumerate(row):
                    if i < len(columns):
                        row_dict[columns[i]] = value
                result.append(row_dict)
            return result
        else:
            print("No results found")
            return []
    except Exception as e:
        print("Error executing SQL:", str(e))
        raise
    finally:
        conn.close()

def summarize_rows(rows: List[Dict[str, Any]]) -> str:
    data = {"rows": rows}
    prompt = json.dumps(data, ensure_ascii=False)
    try:
        llm_response = client.ask_text(prompt, system_prompt=SUMMARY_SYSTEM, temperature=0.2)
        answer=re.sub(r"<think>.*?</think>", "", llm_response, flags=re.DOTALL).strip()
        return answer
    except LLMerror:
        total_cents = sum(int(r.get("amount_cents", 0)) for r in rows)
        dollar = round(total_cents / 100.0, 2)
        return f"共 {len(rows)} 条记录，合计约 {dollar} dollar。建议关注高频商户与大额支出。"
