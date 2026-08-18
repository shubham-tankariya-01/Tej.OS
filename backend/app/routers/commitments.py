from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorCollection
from typing import Annotated, Literal, Optional
from datetime import datetime, timezone, date, timedelta
from bson import ObjectId

from app.db import get_commitments_collection, get_users_collection, get_atonement_rules_collection, get_atonement_instances_collection
from app.api.deps import get_current_user
from app.schemas.user import UserInDB, UserPrivate, UserPublic
from app.schemas.commitment import CommitmentCreate, CommitmentInDB, CommitmentPublic, CheckInUpdate
from app.core.points_math import calculate_points_update

router = APIRouter(prefix="/commitments", tags=["Commitments"])

async def apply_atonement_triggers(current_user: UserInDB, user_updates: dict, now: datetime):
    new_points_total = user_updates.get("points_total", current_user.points_total)
    if new_points_total < 0:
        rules_col = await get_atonement_rules_collection()
        instances_col = await get_atonement_instances_collection()
        active_rules_cursor = rules_col.find({"active": True})
        rules = await active_rules_cursor.to_list(length=None)
        
        active_atonement_ids = current_user.active_atonement_ids.copy()
        new_instances = []
        for r in rules:
            rule_id_str = str(r["_id"])
            if new_points_total <= r["threshold"] and rule_id_str not in active_atonement_ids:
                new_instances.append({
                    "user_id": current_user.id,
                    "rule_id": rule_id_str,
                    "description": r["description"],
                    "activated_at": now,
                    "completed_at": None,
                    "status": "pending"
                })
                active_atonement_ids.append(rule_id_str)
                
        if new_instances:
            await instances_col.insert_many(new_instances)
            user_updates["active_atonement_ids"] = active_atonement_ids

def get_today() -> date:
    # We will use UTC date as the standard for this phase
    return datetime.now(timezone.utc).date()

@router.post("", response_model=CommitmentPublic)
async def create_or_update_commitment(
    data: CommitmentCreate,
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    commitments: Annotated[AsyncIOMotorCollection, Depends(get_commitments_collection)]
):
    today = get_today()
    target_date_str = today.isoformat()
    
    existing = await commitments.find_one({
        "user_id": current_user.id,
        "target_date": target_date_str
    })
    
    if existing:
        if existing["check_in_status"] != "pending":
            raise HTTPException(status_code=400, detail="Commitment is already locked for today.")
        
        await commitments.update_one(
            {"_id": existing["_id"]},
            {"$set": {"content": data.content, "format": data.format}}
        )
        existing["content"] = data.content
        existing["format"] = data.format
        existing["_id"] = str(existing["_id"])
        return existing
    
    new_doc = {
        "user_id": current_user.id,
        "target_date": target_date_str,
        "format": data.format,
        "content": data.content,
        "created_at": datetime.now(timezone.utc),
        "check_in_status": "pending",
        "checked_in_at": None,
        "points_awarded": 0
    }
    
    result = await commitments.insert_one(new_doc)
    new_doc["_id"] = str(result.inserted_id)
    return new_doc

@router.get("/me/today", response_model=CommitmentPublic)
async def get_my_today_commitment(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    commitments: Annotated[AsyncIOMotorCollection, Depends(get_commitments_collection)]
):
    today = get_today()
    existing = await commitments.find_one({
        "user_id": current_user.id,
        "target_date": today.isoformat()
    })
    if not existing:
        raise HTTPException(status_code=404, detail="No commitment found for today")
    
    existing["_id"] = str(existing["_id"])
    return existing

@router.post("/{commitment_id}/check-in", response_model=CommitmentPublic)
async def check_in_commitment(
    commitment_id: str,
    data: CheckInUpdate,
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    commitments: Annotated[AsyncIOMotorCollection, Depends(get_commitments_collection)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    try:
        obj_id = ObjectId(commitment_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid commitment ID")

    commitment = await commitments.find_one({"_id": obj_id})
    if not commitment:
        raise HTTPException(status_code=404, detail="Commitment not found")
        
    if str(commitment["user_id"]) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to check in this commitment")
        
    if current_user.ghost_mode:
        raise HTTPException(status_code=403, detail="Cannot check in while in Ghost Mode. Submit a redemption task.")

    if commitment["check_in_status"] != "pending":
        raise HTTPException(status_code=409, detail="Already checked in")
        
    now = datetime.now(timezone.utc)
    target_date = date.fromisoformat(commitment["target_date"])
    
    # Calculate points and streak updates
    try:
        math_result = calculate_points_update(current_user, data.status, data.use_freeze)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    points = math_result["points_awarded"]
    user_updates = math_result["user_updates"]
    user_updates["last_check_in_date"] = now
    
    # Atonement triggers
    await apply_atonement_triggers(current_user, user_updates, now)

    await users.update_one(
        {"_id": current_user.id},
        {"$set": user_updates}
    )
    
    update_doc = {
        "check_in_status": data.status,
        "checked_in_at": now,
        "points_awarded": points
    }
    
    await commitments.update_one(
        {"_id": obj_id},
        {"$set": update_doc}
    )
    
    commitment.update(update_doc)
    commitment["_id"] = str(commitment["_id"])
    return commitment

@router.get("/squad/today", response_model=list[CommitmentPublic])
async def get_squad_today_status(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
    commitments: Annotated[AsyncIOMotorCollection, Depends(get_commitments_collection)]
):
    today = get_today().isoformat()
    cursor = commitments.find({"target_date": today})
    docs = await cursor.to_list(length=4)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs

@router.post("/admin/close-day")
async def close_day(
    target_date_str: str,
    commitments: Annotated[AsyncIOMotorCollection, Depends(get_commitments_collection)],
    users: Annotated[AsyncIOMotorCollection, Depends(get_users_collection)]
):
    try:
        target_date = date.fromisoformat(target_date_str)
    except:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
        
    cursor = users.find({})
    all_users = await cursor.to_list(length=None)
    
    results = {"processed": 0, "marked_missed": 0}
    
    for u in all_users:
        results["processed"] += 1
        user_id = str(u["_id"])
        
        comm = await commitments.find_one({"user_id": user_id, "target_date": target_date_str})
        
        if not comm or comm["check_in_status"] == "pending":
            now = datetime.now(timezone.utc)
            u_obj = u.copy()
            u_obj["_id"] = str(u_obj["_id"])
            user_in_db = UserInDB(**u_obj)
            
            math_result = calculate_points_update(user_in_db, "missed", False)
            points = math_result["points_awarded"]
            user_updates = math_result["user_updates"]
            user_updates["last_check_in_date"] = now
            
            await apply_atonement_triggers(user_in_db, user_updates, now)

            if comm:
                await commitments.update_one(
                    {"_id": comm["_id"]},
                    {"$set": {
                        "check_in_status": "missed",
                        "checked_in_at": now,
                        "points_awarded": points
                    }}
                )
            else:
                new_doc = {
                    "user_id": user_id,
                    "target_date": target_date_str,
                    "format": "text",
                    "content": "",
                    "created_at": now,
                    "check_in_status": "missed",
                    "checked_in_at": now,
                    "points_awarded": points
                }
                await commitments.insert_one(new_doc)
            
            await users.update_one(
                {"_id": u["_id"]},
                {"$set": user_updates}
            )
            results["marked_missed"] += 1
            
    return results
