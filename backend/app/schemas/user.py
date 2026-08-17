from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Literal, Optional

class UserBase(BaseModel):
    username: str
    display_name: str
    avatar_seed: str
    tagline: Optional[str] = None
    daily_commitment_format: Literal["text", "voice_note_style_text", "checklist"] = "text"
    points_rules_accepted: bool = False
    points_rules_accepted_at: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    password_hash: str
    created_at: datetime
    updated_at: datetime
    onboarding_complete: bool = False

    model_config = ConfigDict(populate_by_name=True)

class UserPublic(BaseModel):
    id: str = Field(alias="_id")
    display_name: str
    avatar_seed: str
    tagline: Optional[str] = None
    onboarding_complete: bool

    model_config = ConfigDict(populate_by_name=True)

class UserPrivate(UserPublic):
    username: str
    daily_commitment_format: Literal["text", "voice_note_style_text", "checklist"]
    points_rules_accepted: bool
