from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, date
from typing import Literal, Optional

class CommitmentBase(BaseModel):
    user_id: str
    target_date: date # renamed from date to avoid python keyword overlap, but serialized as target_date
    format: Literal["text", "voice_note_style_text", "checklist"]
    content: str

class CommitmentCreate(BaseModel):
    content: str
    format: Literal["text", "voice_note_style_text", "checklist"]

class CommitmentInDB(CommitmentBase):
    id: str = Field(default_factory=lambda: "", alias="_id")
    created_at: datetime
    check_in_status: Literal["pending", "done", "partial", "missed"] = "pending"
    checked_in_at: Optional[datetime] = None
    points_awarded: int = 0

    model_config = ConfigDict(populate_by_name=True)

class CommitmentPublic(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    target_date: date
    format: Literal["text", "voice_note_style_text", "checklist"]
    content: str
    created_at: datetime
    check_in_status: Literal["pending", "done", "partial", "missed"]
    checked_in_at: Optional[datetime] = None
    points_awarded: int

    model_config = ConfigDict(populate_by_name=True)

class CheckInUpdate(BaseModel):
    status: Literal["done", "partial", "missed"]
    use_freeze: bool = False
