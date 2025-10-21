# backend/db.py
import os
from dotenv import load_dotenv
import libsql

load_dotenv()  # 读取项目根目录 .env

# 按官方 quickstart 的变量名（更通用）
TURSO_DATABASE_URL = os.getenv("TURSO_DATABASE_URL") or os.getenv("LIBSQL_URL")
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN") or os.getenv("LIBSQL_AUTH_TOKEN")

def get_conn():
    if not TURSO_DATABASE_URL or not TURSO_AUTH_TOKEN:
        raise RuntimeError("Missing TURSO_DATABASE_URL / TURSO_AUTH_TOKEN (or LIBSQL_URL / LIBSQL_AUTH_TOKEN)")
    # 建议使用嵌入副本文件名（本地缓存），名称自定
    conn = libsql.connect("replica.db", sync_url=TURSO_DATABASE_URL, auth_token=TURSO_AUTH_TOKEN)
    conn.sync()  # 同步一次
    return conn

def init_db():
    conn = get_conn()
    with open("schema.sql", "r", encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
