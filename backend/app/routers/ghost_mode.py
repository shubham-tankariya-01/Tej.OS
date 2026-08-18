from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId
from datetime import datetime, timezone

from app.db import get_users_collection, get_redemption_tasks_collection
from app.api.deps import get_current_user
from app.schemas.user import UserInDB
from app.schemas.points import RedemptionTask, RedemptionTaskCreate

router = APIRouter(prefix="/ghost-mode", tags=["Ghost Mode"])

@router.get("/me")
async def get_my_ghost_mode_status(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    redemption_tasks: Annotated[AsyncIOMotorCollection, Depends(get_redemption_tasks_collection)]
):
    status = {"ghost_mode": current_user.ghost_mode, "pending_task": None}
    if current_user.ghost_mode:
        task = await redemption_tasks.find_one({"user_id": current_user.id, "status": "pending"})
        if task:
            task["_id"] = str(task["_id"])
            status["pending_task"] = task
    return status

@router.post("/redemption", response_model=RedemptionTask)
async def submit_redemption_task(
    data: RedemptionTaskCreate,
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    redemption_tasks: Annotated[AsyncIOMotorCollection, Depends(get_redemption_tasks_collection)]
):
    if not current_user.ghost_mode:
        raise HTTPException(status_code=400, detail="You are not in Ghost Mode")
        
    existing = await redemption_tasks.find_one({"user_id": current_user.id, "status": "pending"})
    if existing:
        raise HTTPException(status_code=409, detail="You already have a pending redemption task")
        
    new_task = {
        "user_id": current_user.id,
        "description": data.description,
        "link": data.link,
        "submitted_at": datetime.now(timezone.utc),
        "cosigns": [],
        "status": "pending"
    }
    
    result = await redemption_tasks.insert_one(new_task)
    new_task["_id"] = str(result.inserted_id)
    return new_task

@router.get("/redemption/{task_id}", response_model=RedemptionTask)
async def get_redemption_task(
    task_id: str,
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    redemption_tasks: Annotated[AsyncIOMotorCollection, Depends(get_redemption_tasks_collection)]
):
    try:
        obj_id = ObjectId(task_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID")
        
    task = await redemption_tasks.find_one({"_id": obj_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task["_id"] = str(task["_id"])
    return task

@router.post("/redemption/{task_id}/cosign")
async def cosign_redemption_task(
    task_id: str,
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    redemption_tasks: Annotated[AsyncIOMotorCollection, Depends(get_redemption_tasks_collection)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    try:
        obj_id = ObjectId(task_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID")
        
    task = await redemption_tasks.find_one({"_id": obj_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task["user_id"] == current_user.id:
        raise HTTPException(status_code=403, detail="You cannot cosign your own task")
        
    if task["status"] != "pending":
        raise HTTPException(status_code=400, detail="Task is already processed")
        
    if current_user.id in task["cosigns"]:
        raise HTTPException(status_code=409, detail="You already cosigned this task")
        
    cosigns = task["cosigns"]
    cosigns.append(current_user.id)
    
    # Check total users to determine threshold
    total_users = await users.count_documents({})
    required_cosigns = total_users - 1
    
    status = "pending"
    if len(cosigns) >= required_cosigns:
        status = "approved"
        
    await redemption_tasks.update_one(
        {"_id": obj_id},
        {"$set": {"cosigns": cosigns, "status": status}}
    )
    
    if status == "approved":
        # Free from ghost mode, reset points to -50
        await users.update_one(
            {"_id": task["user_id"]},
            {"$set": {
                "ghost_mode": False,
                "points_total": -50,
                "recovery_day": 1, # Start recovery immediately
                "current_streak": 0
            }}
        )
        
    task["cosigns"] = cosigns
    task["status"] = status
    task["_id"] = str(task["_id"])
    return task
