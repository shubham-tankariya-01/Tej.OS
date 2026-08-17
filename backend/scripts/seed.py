import asyncio
import os
import sys
from datetime import datetime, timezone
from uuid import uuid4

# Add the parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import connect_to_mongo, close_mongo_connection, get_users_collection
from app.core.security import get_password_hash

async def seed_users():
    await connect_to_mongo()
    users_collection = await get_users_collection()
    
    # Check if users already exist
    count = await users_collection.count_documents({})
    if count >= 4:
        print("Database already seeded with 4 users.")
        await close_mongo_connection()
        return

    # Seed data
    seed_users_data = [
        {"username": "member1", "display_name": "Member One", "avatar_seed": "seed1"},
        {"username": "member2", "display_name": "Member Two", "avatar_seed": "seed2"},
        {"username": "member3", "display_name": "Member Three", "avatar_seed": "seed3"},
        {"username": "member4", "display_name": "Member Four", "avatar_seed": "seed4"},
    ]
    
    default_password = os.environ.get("SEED_PASSWORD", "password123")
    hashed_pw = get_password_hash(default_password)
    
    docs = []
    now = datetime.now(timezone.utc)
    for u in seed_users_data:
        doc = {
            "_id": str(uuid4()),
            "username": u["username"],
            "display_name": u["display_name"],
            "avatar_seed": u["avatar_seed"],
            "tagline": None,
            "daily_commitment_format": "text",
            "points_rules_accepted": False,
            "points_rules_accepted_at": None,
            "password_hash": hashed_pw,
            "created_at": now,
            "updated_at": now,
            "onboarding_complete": False
        }
        docs.append(doc)
        
    await users_collection.insert_many(docs)
    
    print(f"Successfully seeded {len(docs)} users.")
    print(f"Usernames: {', '.join([u['username'] for u in seed_users_data])}")
    print(f"Default Password: {default_password}")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(seed_users())
