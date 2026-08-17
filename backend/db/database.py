from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client = AsyncIOMotorClient(settings.mongodb_url)
db = client[settings.db_name]

# Helper function to get database instance
def get_db():
    return db
