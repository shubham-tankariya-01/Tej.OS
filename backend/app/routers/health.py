from fastapi import APIRouter, Depends
from app.db import get_database

router = APIRouter()

@router.get("/health")
async def health_check(db = Depends(get_database)):
    try:
        # Ping the database to verify connectivity
        await db.command("ping")
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": "disconnected", "detail": str(e)}
