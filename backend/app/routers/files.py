from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import Annotated
from datetime import datetime, timezone
import uuid
import magic

from motor.motor_asyncio import AsyncIOMotorGridFSBucket, AsyncIOMotorCollection

from app.db import get_gridfs_bucket, get_files_meta_collection
from app.api.deps import get_current_user
from app.schemas.user import UserInDB
from app.schemas.post import FileMeta

router = APIRouter(prefix="/files", tags=["Files"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_USER_STORAGE = 100 * 1024 * 1024  # 100MB

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "application/pdf", "text/plain", "text/markdown", "text/csv",
    "application/json", "application/javascript", "video/mp2t", # tsc/js fallback
}

@router.post("", response_model=FileMeta)
async def upload_file(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    fs: AsyncIOMotorGridFSBucket = Depends(get_gridfs_bucket),
    files_meta: AsyncIOMotorCollection = Depends(get_files_meta_collection)
):
    # 1. Read first chunk to check mime type
    header = await file.read(2048)
    mime_type = magic.from_buffer(header, mime=True)
    
    # Many text files just come back as text/plain from python-magic
    if not mime_type.startswith("text/") and mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {mime_type}")
    
    # Rewind
    await file.seek(0)
    
    # 2. Check size manually since UploadFile doesn't have length until read
    contents = await file.read()
    size_bytes = len(contents)
    if size_bytes > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"File exceeds 10MB limit (size: {size_bytes / 1024 / 1024:.2f}MB)")
        
    # 3. Check user storage cap
    user_files = await files_meta.find({"uploader_id": current_user.id}).to_list(length=1000)
    total_used = sum(f.get("size_bytes", 0) for f in user_files)
    if total_used + size_bytes > MAX_USER_STORAGE:
        raise HTTPException(status_code=413, detail="Upload would exceed your 100MB storage quota.")

    # 4. Upload to GridFS
    # We use a custom object_id for reference
    file_id = str(uuid.uuid4())
    grid_in = fs.open_upload_stream(
        filename=file.filename or "unnamed",
        metadata={"content_type": mime_type, "uploader_id": current_user.id}
    )
    await grid_in.write(contents)
    await grid_in.close()

    # 5. Save meta
    meta = FileMeta(
        _id=file_id,
        uploader_id=current_user.id,
        original_filename=file.filename or "unnamed",
        content_type=mime_type,
        size_bytes=size_bytes,
        storage_key=str(grid_in._id),
        created_at=datetime.now(timezone.utc)
    )
    await files_meta.insert_one(meta.model_dump(by_alias=True))
    
    return meta

from bson import ObjectId

@router.get("/{file_id}")
async def get_file(
    file_id: str,
    current_user: UserInDB = Depends(get_current_user),
    fs: AsyncIOMotorGridFSBucket = Depends(get_gridfs_bucket),
    files_meta: AsyncIOMotorCollection = Depends(get_files_meta_collection)
):
    meta_doc = await files_meta.find_one({"_id": file_id})
    if not meta_doc:
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        grid_out = await fs.open_download_stream(ObjectId(meta_doc["storage_key"]))
    except Exception:
        raise HTTPException(status_code=404, detail="File content not found in storage")
        
    async def stream_generator():
        while True:
            chunk = await grid_out.readchunk()
            if not chunk:
                break
            yield chunk

    return StreamingResponse(
        stream_generator(), 
        media_type=meta_doc["content_type"],
        headers={"Content-Disposition": f'inline; filename="{meta_doc["original_filename"]}"'}
    )
