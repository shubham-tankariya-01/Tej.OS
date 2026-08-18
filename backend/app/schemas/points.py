from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Literal, Optional, List

class RedemptionTask(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    description: str
    link: Optional[str] = None
    submitted_at: datetime
    cosigns: List[str] = []
    status: Literal["pending", "approved"] = "pending"

    model_config = ConfigDict(populate_by_name=True)

class RedemptionTaskCreate(BaseModel):
    description: str
    link: Optional[str] = None

class AtonementRule(BaseModel):
    id: str = Field(alias="_id")
    threshold: int
    description: str
    active: bool = True

    model_config = ConfigDict(populate_by_name=True)

class AtonementInstance(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    rule_id: str
    description: str # Copied from rule for easier display without joins
    activated_at: datetime
    completed_at: Optional[datetime] = None
    status: Literal["pending", "completed"] = "pending"

    model_config = ConfigDict(populate_by_name=True)
