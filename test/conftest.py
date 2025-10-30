# tests/conftest.py  (Step 1)
import os
import sys
from pathlib import Path
import sqlite3
import pytest
from fastapi.testclient import TestClient

# 固定测试期的密钥/配置，保证 JWT 能解、登录不过期
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("LOGIN_EXPIRE", "2")
os.environ.setdefault("ENV", "test")

# Mock LLM responses for testing
def mock_llm_response(*args, **kwargs):
    return "Mocked LLM response for testing"
os.environ.setdefault("SQL_MODEL", "qwen/qwen-2.5-coder-32b-instruct:free")

DB_URL = "file:pytest_db?mode=memory&cache=shared"

# 添加后端路径到 Python 路径
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))
# 导入后端模块
import db as dbmod
from app import app


@pytest.fixture(scope="function")
def  test_db_connection():
    conn = sqlite3.connect(DB_URL, uri=True, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    schema_path = backend_path / "schema.sql"
    with open(schema_path, "r", encoding="utf-8") as f:
        sql_content = f.read()
        conn.executescript(sql_content)
    tables = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table';"
    ).fetchall()
    yield DB_URL
    conn.close()

@pytest.fixture(scope="function")
def client(test_db_connection, monkeypatch):
    def get_test_conn():
        conn = sqlite3.connect(test_db_connection, uri=True, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    monkeypatch.setattr(dbmod, "get_conn", get_test_conn,raising=True)
    return TestClient(app)

