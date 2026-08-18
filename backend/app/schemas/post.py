from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Literal, Optional, List
from app.schemas.user import UserPublic

class PostBase(BaseModel):
    title: str
    body: Optional[str] = None
    tags: List[str] = []
    contribution_type: Literal["taught_concept", "shared_resource", "brain_dump", "reflection"]
    file_id: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostInDB(PostBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    updated_at: datetime
    edited: bool = False

    model_config = ConfigDict(populate_by_name=True)

class PostPublic(PostInDB):
    author: UserPublic

class PostUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    tags: Optional[List[str]] = None
    contribution_type: Optional[Literal["taught_concept", "shared_resource", "brain_dump", "reflection"]] = None
    # file_id is specifically NOT editable via PATCH endpoint to avoid orphaned files

class FileMeta(BaseModel):
    id: str = Field(alias="_id")
    uploader_id: str
    original_filename: str
    content_type: str
    size_bytes: int
    storage_key: str  # maps to GridFS file _id
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)
