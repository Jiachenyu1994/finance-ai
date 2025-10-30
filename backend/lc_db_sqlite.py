# backend/lc_db_sqlite.py
import os
from sqlalchemy import create_engine
from langchain_community.utilities import SQLDatabase
from db import get_conn

def _sync_replica_once():
    """
    启动时与 Turso 同步一次，确保本地副本包含最新的表结构。
    只做一次：这一步是“schema 准确”的关键，但不会放到每次查询里。
    """
    conn = get_conn()
    try:
        print("🔄 Syncing replica from Turso ...")
        conn.sync()
        print("✅ Sync done.")
    finally:
        conn.close()

def _report_replica_path():
    """
    打印本地副本文件路径，帮助你确认文件放在哪里。
    """
    abs_path = os.path.abspath("replica.db")
    print(f"📄 replica.db path: {abs_path}")
    if not os.path.exists("replica.db"):
        print("⚠️ 还没有 replica.db 文件（第一次运行时由 libsql 自动创建/同步）。")

# --- 1) 启动时同步一次，并报告本地文件路径 ---
_sync_replica_once()
_report_replica_path()

# --- 2) 用标准 SQLite 连接本地副本（免 Rust） ---
engine = create_engine("sqlite:///replica.db")  # 注意三条斜杠表示相对路径文件

# --- 3) 只暴露你需要的表，不附样例行（减少 token） ---
db = SQLDatabase(
    engine,
    include_tables=["transactions"],   # 只给 LLM 看这一张表
    sample_rows_in_table_info=0        # 0 = 不附样例行（最省上下文）
)

# --- 4) 提取 schema 文本，后续 NL→SQL 链直接复用 ---
TABLE_INFO = db.get_table_info()

if __name__ == "__main__":
    print("\n✅ Loaded schema text for LLM:\n")
    print(TABLE_INFO or "（空）")