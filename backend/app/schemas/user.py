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
    
    # Phase 2 Streak State
    current_streak: int = 0
    longest_streak: int = 0
    last_check_in_date: Optional[datetime] = None # Or date, but datetime is easier with pydantic
    points_total: int = 0
    
    # Phase 3 Points Engine State
    ghost_mode: bool = False
    streak_freeze_count: int = 0
    recovery_day: int = 0
    active_atonement_ids: list[str] = []

    model_config = ConfigDict(populate_by_name=True)

class UserPublic(BaseModel):
    id: str = Field(alias="_id")
    display_name: str
    avatar_seed: str
    tagline: Optional[str] = None
    onboarding_complete: bool
    
    # Phase 3 additions
    ghost_mode: bool = False
    
    # Exposed for squad view
    current_streak: int = 0

    model_config = ConfigDict(populate_by_name=True)

class UserPrivate(UserPublic):
    username: str
    daily_commitment_format: Literal["text", "voice_note_style_text", "checklist"]
    points_rules_accepted: bool
    
    longest_streak: int = 0
    last_check_in_date: Optional[datetime] = None
    points_total: int = 0
    
    streak_freeze_count: int = 0
    recovery_day: int = 0
    active_atonement_ids: list[str] = []
