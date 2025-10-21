from fastapi import HTTPException,status,Header,Depends
import jwt
import os
from dotenv import load_dotenv

load_dotenv()  
SECRET = os.getenv("SECRET")
HASH = os.getenv("HASH")

def get_current_user(authorization: str = Header(default=None)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header format")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET, algorithms=[HASH])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")