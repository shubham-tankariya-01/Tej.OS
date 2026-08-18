from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.db import connect_to_mongo, close_mongo_connection, init_indexes
from app.routers import health, auth, users, commitments, ghost_mode, atonement, debug, posts, files

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await init_indexes()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(title="The Pact API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(commitments.router)
app.include_router(ghost_mode.router)
app.include_router(atonement.router)
app.include_router(debug.router)
app.include_router(posts.router)
app.include_router(files.router)
