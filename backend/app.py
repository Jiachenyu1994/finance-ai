from fastapi import FastAPI, UploadFile, File, HTTPException,status,Depends
from pydantic import BaseModel, constr, EmailStr, Field
from typing import Annotated
from util import get_current_user
import db
import uuid
import pandas as pd
import hashlib
import jwt, datetime
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import analysis_service
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()  # 读取项目根目录 .env


@asynccontextmanager
async def lifespan(app: FastAPI):
    env = os.getenv("ENV")
    if env == "prod":
        print("Production environment detected.")
        db.init_db()
    yield
    print("App shutdown complete.")

app = FastAPI(lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Disable credentials
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)




@app.get("/health")
def health():
    # 简单探活 + 试连数据库
    conn = db.get_conn()
    cur = conn.execute("SELECT 1 as ok")
    ok = cur.fetchone()[0]
    conn.close()
    return {"ok": ok == 1}

# 演示：插入一条交易（真实项目里会拆分到 routers）
class Transaction(BaseModel):
    date: Annotated[str, Field(pattern=r"^\d{4}-\d{2}-\d{2}$")]
    merchant: constr(strip_whitespace=True, min_length=1, max_length=100)
    amount_cents: int  
    category: constr(strip_whitespace=True, min_length=1, max_length=50)

@app.post("/api/add_transaction",status_code=status.HTTP_201_CREATED)
def add_transaction(transaction: Transaction,user_id: str = Depends(get_current_user)):
    conn = db.get_conn()
    try:
        tid = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO transactions(id,user_id,date,merchant,amount_cents,category) "
            "VALUES(?, ?, ?, ?, ?, ?)",
            (tid, user_id, transaction.date, transaction.merchant, transaction.amount_cents, transaction.category)
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        conn.commit()
        conn.close()
    return {"inserted_id": tid, "status": "success"}


@app.post("/api/load_csv")
async def load_csv(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    content= await file.read()
    df = pd.read_csv(pd.io.common.BytesIO(content))
    required_columns = {"date", "merchant", "amount_cents", "category"}
    if not required_columns.issubset(df.columns):
        return {"error": f"CSV must contain columns: {', '.join(required_columns)}"}
    conn = db.get_conn()
    for _, row in df.iterrows():
        tid = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO transactions(id,user_id,date,merchant,amount_cents,category) "
            "VALUES(?, ?, ?, ?, ?, ?)",
            (tid, user_id, row["date"], row["merchant"], row["amount_cents"], row["category"] or "uncategorized")
        )
    conn.commit()
    conn.close()
    return {"status": "success", "rows_inserted": len(df)}


class register_user_request(BaseModel):
    username: constr(strip_whitespace=True, min_length=3, max_length=32)
    name: constr(strip_whitespace=True, min_length=1, max_length=64)
    email: EmailStr
    password: constr(min_length=6)

@app.post("/api/register_user",status_code=status.HTTP_201_CREATED)
def register_user(user: register_user_request):
    conn = db.get_conn()
    try:
        print("Debug: register_user called with", user)
        email=user.email.lower()
        exist=conn.execute(
            "SELECT 1 FROM users WHERE email=?",
            (email,)
        ).fetchone()
        if exist:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        user_name = user.username
        password_hash = hashlib.sha256(user.password.encode()).hexdigest()
        conn.execute(
            "INSERT INTO users(user_name, name, email, password_hash) "
            "VALUES(?, ?, ?, ?)",
            (user_name, user.name, email, password_hash)
        )
        conn.commit()
        return {"user_name": user_name, "status": "registered"}
    finally:
        conn.close()
        

class login_user_request(BaseModel):
    identifier: constr(strip_whitespace=True)
    password: constr(min_length=6)


@app.post("/api/login",status_code=status.HTTP_200_OK)
def login_user(user: login_user_request):
    conn = db.get_conn()
    try:
        if not user.identifier:
            return {"status": "failure", "message": "Please provide user_name or email"}
        ident = user.identifier.strip()
        cur = conn.execute(
            "SELECT user_name, name, email, password_hash FROM users WHERE (user_name = ? OR email = ?)",
            (ident, ident.lower())
        )
        found = cur.fetchone()
        if found:
            user_info = {"status": "success", "user_name": found[0], "name": found[1], "email": found[2], "password_hash": found[3]}
            if user_info["password_hash"] == hashlib.sha256(user.password.encode()).hexdigest():
                now = datetime.datetime.utcnow()
                secret = os.getenv("SECRET")
                login_expire = int(os.getenv("LOGIN_EXPIRE", 2))
                hash_algo=os.getenv("HASH","sha256")
                payload = {
                    "sub": user_info["user_name"],
                    "name": user_info["name"],
                    "iat": now,
                    "exp": now + datetime.timedelta(hours=login_expire)
                }
                token = jwt.encode(payload, secret, algorithm=hash_algo)
                return {"status": "success", "token": token,"user_name":user_info["user_name"]}
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password/Username")

        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password/Username")
    finally:
        conn.close()




class AnalyzeReq(BaseModel):
    question: str

class AnalyzeResp(BaseModel):
    sql: str
    rows: list
    summary: str
@app.post("/api/analyze/query",response_model=AnalyzeResp)
def analyze_query(req: AnalyzeReq,user_id: str = Depends(get_current_user)):
    print("debug: analyze_query called")
    try:
        sql = analysis_service.generate_sql(req.question)
        rows = analysis_service.execute_sql(sql, user_id)
        summary = analysis_service.summarize_rows(rows)
        print("debug: analyze_query response:", {"sql": sql, "rows": rows, "summary": summary})
        return AnalyzeResp(sql=sql, rows=rows, summary=summary)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
