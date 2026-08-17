from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class StatusZone(str, Enum):
    VANGUARD = "vanguard"
    NEUTRAL = "neutral"
    PENALTY = "penalty"
    VOID = "void"

class ValidationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class User(BaseModel):
    username: str
    avatar_url: Optional[str] = None
    current_points: int = 0
    daily_streak: int = 0
    status_zone: StatusZone = StatusZone.NEUTRAL

class ProofOfWork(BaseModel):
    author_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    content_type: str
    content_body: str
    tags: List[str] = []
    validation_status: ValidationStatus = ValidationStatus.PENDING
    
class PointLog(BaseModel):
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    point_delta: int
    reason: str
    associated_post_id: Optional[str] = None
