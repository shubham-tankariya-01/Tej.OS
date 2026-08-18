from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId
from datetime import datetime, timezone

from app.db import get_users_collection, get_atonement_rules_collection, get_atonement_instances_collection
from app.api.deps import get_current_user
from app.schemas.user import UserInDB
from app.schemas.points import AtonementRule, AtonementInstance

router = APIRouter(prefix="/atonement", tags=["Atonement"])

@router.get("/rules", response_model=list[AtonementRule])
async def get_atonement_rules(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    rules_col: Annotated[AsyncIOMotorCollection, Depends(get_atonement_rules_collection)]
):
    cursor = rules_col.find({"active": True}).sort("threshold", -1) # e.g. -100 then -250
    rules = await cursor.to_list(length=None)
    for r in rules:
        r["_id"] = str(r["_id"])
    return rules

@router.get("/me", response_model=list[AtonementInstance])
async def get_my_atonement_instances(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    instances_col: Annotated[AsyncIOMotorCollection, Depends(get_atonement_instances_collection)]
):
    cursor = instances_col.find({"user_id": current_user.id, "status": "pending"})
    instances = await cursor.to_list(length=None)
    for i in instances:
        i["_id"] = str(i["_id"])
    return instances

@router.post("/{instance_id}/complete", response_model=AtonementInstance)
async def complete_atonement_instance(
    instance_id: str,
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    instances_col: Annotated[AsyncIOMotorCollection, Depends(get_atonement_instances_collection)],
    users_col: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    try:
        obj_id = ObjectId(instance_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid instance ID")
        
    instance = await instances_col.find_one({"_id": obj_id})
    if not instance:
        raise HTTPException(status_code=404, detail="Atonement instance not found")
        
    if instance["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this instance")
        
    if instance["status"] != "pending":
        raise HTTPException(status_code=400, detail="Instance is already completed")
        
    now = datetime.now(timezone.utc)
    
    await instances_col.update_one(
        {"_id": obj_id},
        {"$set": {
            "status": "completed",
            "completed_at": now
        }}
    )
    
    # Remove rule_id from user's active_atonement_ids
    active_ids = current_user.active_atonement_ids.copy()
    if instance["rule_id"] in active_ids:
        active_ids.remove(instance["rule_id"])
        await users_col.update_one(
            {"_id": current_user.id},
            {"$set": {"active_atonement_ids": active_ids}}
        )
        
    instance["status"] = "completed"
    instance["completed_at"] = now
    instance["_id"] = str(instance["_id"])
    
    return instance
