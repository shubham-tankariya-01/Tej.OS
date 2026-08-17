from motor.motor_asyncio import AsyncIOMotorClient
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

async def close_mongo_connection():
    if db_state.client is not None:
        db_state.client.close()

async def get_database():
    return db_state.db

async def get_users_collection():
    return db_state.db["users"]
