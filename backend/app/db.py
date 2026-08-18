from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from pymongo import ASCENDING, TEXT
from app.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_state = Database()

async def connect_to_mongo():
    db_state.client = AsyncIOMotorClient(settings.MONGO_URI)
    db_state.db = db_state.client[settings.MONGO_DB_NAME]
    
    # Init indexes
    await db_state.db["users"].create_index("username", unique=True)
    await db_state.db["commitments"].create_index([("user_id", 1), ("target_date", 1)], unique=True)

async def close_mongo_connection():
    if db_state.client is not None:
        db_state.client.close()

async def get_database():
    return db_state.db

async def get_users_collection():
    return db_state.db["users"]

async def get_commitments_collection():
    return db_state.db["commitments"]

async def get_redemption_tasks_collection():
    return db_state.db["redemption_tasks"]

async def get_atonement_rules_collection():
    return db_state.db["atonement_rules"]

async def get_atonement_instances_collection():
    return db_state.db["atonement_instances"]

async def get_posts_collection():
    return db_state.db["posts"]

async def get_gridfs_bucket():
    return AsyncIOMotorGridFSBucket(db_state.db)

async def get_files_meta_collection():
    return db_state.db["files_meta"]

async def init_indexes():
    # Posts text index for searching
    posts = db_state.db["posts"]
    await posts.create_index([("title", TEXT), ("body", TEXT)])
