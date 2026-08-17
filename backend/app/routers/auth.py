from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorCollection
from datetime import timedelta
from typing import Annotated

from app.db import get_users_collection
from app.core.security import verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(
    data: LoginRequest,
    response: Response,
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    user_doc = await users.find_one({"username": data.username.strip().lower()})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    is_valid = verify_password(data.password, user_doc["password_hash"])
    if not is_valid:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    access_token = create_access_token(
        data={"sub": user_doc["username"]},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    response.set_cookie(
        key="auth_token",
        value=access_token,
        httponly=True,
        samesite="strict",
        secure=settings.ENV == "production",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {"message": "Logged in successfully"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="auth_token", httponly=True, samesite="strict", secure=settings.ENV == "production")
    return {"message": "Logged out successfully"}
