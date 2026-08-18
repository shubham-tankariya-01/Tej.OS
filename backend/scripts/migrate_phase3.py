import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings
from app.db import connect_to_mongo, close_mongo_connection, get_users_collection, get_atonement_rules_collection

async def run_migration():
    await connect_to_mongo()
    
    users = await get_users_collection()
    rules = await get_atonement_rules_collection()
    
    # 1. Backfill User fields
    print("Backfilling user fields...")
    result = await users.update_many(
        {"ghost_mode": {"$exists": False}},
        {"$set": {
            "ghost_mode": False,
            "streak_freeze_count": 0,
            "recovery_day": 0,
            "active_atonement_ids": []
        }}
    )
    print(f"Updated {result.modified_count} users.")
    
    # 2. Insert default Atonement Rules
    print("Setting up default Atonement Rules...")
    existing_rules = await rules.count_documents({})
    if existing_rules == 0:
        await rules.insert_many([
            {
                "threshold": -100,
                "description": "Post a public video explaining why you failed.",
                "active": True
            },
            {
                "threshold": -250,
                "description": "Host a knowledge sharing session or movie night for the squad.",
                "active": True
            }
        ])
        print("Inserted default atonement rules.")
    else:
        print("Atonement rules already exist.")
        
    await close_mongo_connection()
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(run_migration())
