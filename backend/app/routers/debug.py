from fastapi import APIRouter, Depends
from typing import Annotated
from motor.motor_asyncio import AsyncIOMotorCollection

from app.db import get_users_collection, get_commitments_collection, get_atonement_instances_collection, get_redemption_tasks_collection
from app.api.deps import get_current_user
from app.schemas.user import UserInDB

router = APIRouter(prefix="/debug", tags=["Debug Tools"])

@router.post("/setup-atonement-test")
async def setup_atonement_test(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    """Sets streak to 120 so the next Missed day triggers a -100 penalty, hitting the first Atonement threshold."""
    await users.update_one(
        {"_id": current_user.id},
        {"$set": {
            "current_streak": 120,
            "points_total": 0,
            "ghost_mode": False
        }}
    )
    return {"status": "ok"}

@router.post("/setup-ghost-test")
async def setup_ghost_test(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    """Sets points to -350 and streak to 60. Next missed day drops to -410, triggering Ghost Mode."""
    await users.update_one(
        {"_id": current_user.id},
        {"$set": {
            "current_streak": 60,
            "points_total": -350,
            "ghost_mode": False
        }}
    )
    return {"status": "ok"}

@router.post("/give-freeze")
async def give_freeze(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    """Grants 1 streak freeze token."""
    await users.update_one(
        {"_id": current_user.id},
        {"$inc": {"streak_freeze_count": 1}}
    )
    return {"status": "ok"}

@router.post("/reset-me")
async def reset_me(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)],
    commitments: Annotated[AsyncIOMotorCollection, Depends(get_commitments_collection)],
    atonements: Annotated[AsyncIOMotorCollection, Depends(get_atonement_instances_collection)],
    redemptions: Annotated[AsyncIOMotorCollection, Depends(get_redemption_tasks_collection)]
):
    """Resets all phase 3 states back to fresh."""
    await users.update_one(
        {"_id": current_user.id},
        {"$set": {
            "current_streak": 0,
            "points_total": 0,
            "ghost_mode": False,
            "recovery_day": 0,
            "streak_freeze_count": 0,
            "active_atonement_ids": []
        }}
    )
    await commitments.delete_many({"user_id": current_user.id})
    await atonements.delete_many({"user_id": current_user.id})
    await redemptions.delete_many({"user_id": current_user.id})
    return {"status": "ok"}
