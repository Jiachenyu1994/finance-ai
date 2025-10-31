from dotenv import load_dotenv
import os, re
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.schema import StrOutputParser


from lc_db_sqlite import TABLE_INFO

load_dotenv()

sql_LLM=ChatOpenAI(
    model_name=os.getenv("SQL_MODEL"),
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv("OPENROUTER_BASE_URL"),
    max_tokens=128,
    temperature=0,
    max_retries=3,
    timeout=20,
    default_headers={
        "HTTP-Referer": "https://github.com/Jiachenyu1994/finance-ai",
        "X-Title": "Finance AI Assistant"
    }
)

sql_prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are an expert SQLite SQL generator.\n"
     "Your ONLY job is to output ONE single-line SELECT statement compatible with SQLite.\n"
     "Never output explanations / markdown / comments / JSON.\n"
     "Security rules (MANDATORY):\n"
     " - FORBIDDEN keywords: INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, PRAGMA, ATTACH.\n"
     " - MUST include user isolation: WHERE user_id = ?\n"
     "Database schema:\n{table_info}\n"
     "Styling & logic rules:\n"
     " 1) Use ONLY table: transactions.\n"
     " 2) Prefer explicit column projections, add ORDER/LIMIT when implied.\n"
     " 3) Dates are YYYY-MM-DD; recent = ORDER BY date DESC.\n"
     " 4) amount_cents is in cents; do NOT convert unless explicitly asked.\n"
     "Output STRICTLY ONE SQLite SELECT statement."

     "日期规则： \n"
     "1. “last month” = the previous full calendar month\n"
     "2. use last 30 day as filter"
     "3. Do not use date('now', '-1 month') alone as a filter\n"
    ),

    ("user",
     "Question: {question}\nReturn SQL only:")
])

_sql_chain=sql_prompt | sql_LLM | StrOutputParser()

# --- 安全关键词黑名单 ---
UNSAFE_PATTERN = re.compile(r"\b(drop|delete|update|insert|alter|truncate|attach|pragma)\b", re.I)


def generate_sql(question: str, user_id_required: str) -> str:

    raw = _sql_chain.invoke({'table_info': TABLE_INFO, 'question': question}).strip()

    sql= re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL).strip()

    sql= " ".join(sql.split())
    print("debug: generated SQL:", sql)

    lower_sql = sql.lower()
    if not lower_sql.startswith("select"):
        raise ValueError("Generated SQL is not a SELECT statement.")
    if UNSAFE_PATTERN.search(sql):
        raise ValueError("Unsafe SQL keywords detected.")
    
        # 自动补充 user_id 过滤
    if user_id_required and "user_id" not in lower_sql:
        sql += (" AND" if " where " in lower_sql else " WHERE") + " user_id = ?"

    return sql

# if __name__ == "__main__":
# from sql_ai_generator import execute_sql
#     test_q = "最近一笔支出是什么？"
#     print("🧠 Question:", test_q)
#     print("🧾 SQL:", generate_sql(test_q, user_id_required=True))
#     print(execute_sql(generate_sql(test_q, user_id_required=True), "tester"))
    

