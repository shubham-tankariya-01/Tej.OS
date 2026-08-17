from fastapi import Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorCollection
from typing import Annotated
from app.core.security import decode_access_token
from app.db import get_users_collection
from app.schemas.user import UserInDB

async def get_current_user(
    request: Request,
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
) -> UserInDB:
    token = request.cookies.get("auth_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
        
    user_doc = await users.find_one({"username": username})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
        
    return UserInDB(**user_doc)
