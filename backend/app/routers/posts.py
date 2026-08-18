from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Annotated, List, Optional
from datetime import datetime, timezone
import uuid
from bson import ObjectId

from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorGridFSBucket

from app.db import get_posts_collection, get_users_collection, get_files_meta_collection, get_gridfs_bucket
from app.api.deps import get_current_user
from app.schemas.user import UserInDB
from app.schemas.post import PostCreate, PostInDB, PostPublic, PostUpdate

router = APIRouter(prefix="/posts", tags=["Posts"])

@router.post("", response_model=PostInDB)
async def create_post(
    post_in: PostCreate,
    current_user: UserInDB = Depends(get_current_user),
    posts: AsyncIOMotorCollection = Depends(get_posts_collection)
):
    now = datetime.now(timezone.utc)
    # tags to lowercase
    normalized_tags = list(set([t.lower().strip() for t in post_in.tags if t.strip()]))
    
    post = PostInDB(
        _id=str(uuid.uuid4()),
        user_id=current_user.id,
        created_at=now,
        updated_at=now,
        tags=normalized_tags,
        **post_in.model_dump(exclude={"tags"})
    )
    
    await posts.insert_one(post.model_dump(by_alias=True))
    return post

@router.get("", response_model=List[PostPublic])
async def get_feed(
    current_user: UserInDB = Depends(get_current_user),
    posts: AsyncIOMotorCollection = Depends(get_posts_collection),
    tags: Optional[List[str]] = Query(None),
    contribution_type: Optional[str] = None,
    user_id: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    match_query = {}
    
    if q:
        match_query["$text"] = {"$search": q}
    if tags:
        match_query["tags"] = {"$in": [t.lower() for t in tags]}
    if contribution_type:
        match_query["contribution_type"] = contribution_type
    if user_id:
        match_query["user_id"] = user_id

    # Aggregation to join author
    pipeline = [
        {"$match": match_query},
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": limit},
        {
            "$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "author_docs"
            }
        },
        {
            "$addFields": {
                "author": {"$arrayElemAt": ["$author_docs", 0]}
            }
        },
        {"$project": {"author_docs": 0, "author.password_hash": 0}}
    ]
    
    cursor = posts.aggregate(pipeline)
    results = await cursor.to_list(length=limit)
    return results

@router.get("/{post_id}", response_model=PostPublic)
async def get_post(
    post_id: str,
    current_user: UserInDB = Depends(get_current_user),
    posts: AsyncIOMotorCollection = Depends(get_posts_collection)
):
    pipeline = [
        {"$match": {"_id": post_id}},
        {
            "$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "author_docs"
            }
        },
        {
            "$addFields": {
                "author": {"$arrayElemAt": ["$author_docs", 0]}
            }
        },
        {"$project": {"author_docs": 0, "author.password_hash": 0}}
    ]
    cursor = posts.aggregate(pipeline)
    results = await cursor.to_list(length=1)
    if not results:
        raise HTTPException(status_code=404, detail="Post not found")
    return results[0]

@router.patch("/{post_id}", response_model=PostInDB)
async def update_post(
    post_id: str,
    update_data: PostUpdate,
    current_user: UserInDB = Depends(get_current_user),
    posts: AsyncIOMotorCollection = Depends(get_posts_collection)
):
    existing = await posts.find_one({"_id": post_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    if existing["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")

    updates = update_data.model_dump(exclude_unset=True)
    if "tags" in updates and updates["tags"] is not None:
        updates["tags"] = list(set([t.lower().strip() for t in updates["tags"] if t.strip()]))
    
    updates["updated_at"] = datetime.now(timezone.utc)
    updates["edited"] = True
    
    if not updates:
        return existing
        
    updated = await posts.find_one_and_update(
        {"_id": post_id},
        {"$set": updates},
        return_document=True
    )
    return updated

@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: UserInDB = Depends(get_current_user),
    posts: AsyncIOMotorCollection = Depends(get_posts_collection),
    files_meta: AsyncIOMotorCollection = Depends(get_files_meta_collection),
    fs: AsyncIOMotorGridFSBucket = Depends(get_gridfs_bucket)
):
    existing = await posts.find_one({"_id": post_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    if existing["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    # If it has a file, delete it
    if existing.get("file_id"):
        meta = await files_meta.find_one({"_id": existing["file_id"]})
        if meta:
            try:
                await fs.delete(ObjectId(meta["storage_key"]))
            except Exception:
                pass # file might be already gone
            await files_meta.delete_one({"_id": existing["file_id"]})

    await posts.delete_one({"_id": post_id})
    return {"status": "ok"}

@router.get("/tags/all", response_model=List[str])
async def get_all_tags(
    current_user: UserInDB = Depends(get_current_user),
    posts: AsyncIOMotorCollection = Depends(get_posts_collection)
):
    tags = await posts.distinct("tags")
    return sorted(tags)
