from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorCollection
from typing import Annotated, Literal, Optional
from datetime import datetime, timezone

from app.db import get_users_collection
from app.api.deps import get_current_user
from app.schemas.user import UserCreate, UserInDB, UserPrivate, UserPublic

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me/streak-freezes")
async def get_my_streak_freezes(
    current_user: Annotated[UserInDB, Depends(get_current_user)]
):
    return {"streak_freeze_count": current_user.streak_freeze_count}

class OnboardingUpdate(BaseModel):
    display_name: str
    avatar_seed: str
    tagline: Optional[str] = None
    daily_commitment_format: Literal["text", "voice_note_style_text", "checklist"]

@router.get("/me", response_model=UserPrivate)
async def get_me(current_user: Annotated[UserInDB, Depends(get_current_user)]):
    return current_user

@router.patch("/me/onboarding", response_model=UserPrivate)
async def complete_onboarding(
    data: OnboardingUpdate,
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    update_data = data.model_dump()
    update_data["onboarding_complete"] = True
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await users.update_one(
        {"_id": current_user.id},
        {"$set": update_data}
    )
    
    updated_doc = await users.find_one({"_id": current_user.id})
    return UserInDB(**updated_doc)

@router.post("/me/accept-rules", response_model=UserPrivate)
async def accept_rules(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    update_data = {
        "points_rules_accepted": True,
        "points_rules_accepted_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await users.update_one(
        {"_id": current_user.id},
        {"$set": update_data}
    )
    
    updated_doc = await users.find_one({"_id": current_user.id})
    return UserInDB(**updated_doc)

@router.get("/roster", response_model=list[UserPublic])
async def get_roster(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    cursor = users.find({})
    user_docs = await cursor.to_list(length=4)
    return [UserPublic(**doc) for doc in user_docs]

class UserStreak(BaseModel):
    current_streak: int
    longest_streak: int
    points_total: int

@router.get("/me/streak", response_model=UserStreak)
async def get_my_streak(current_user: Annotated[UserInDB, Depends(get_current_user)]):
    return UserStreak(
        current_streak=current_user.current_streak,
        longest_streak=current_user.longest_streak,
        points_total=current_user.points_total
    )
