from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import client, get_db

app = FastAPI(title="Tej.OS API", version="1.0.0")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    try:
        # Verify db connection
        await client.admin.command('ping')
        return {"status": "online", "message": "System Online: Database Connected"}
    except Exception as e:
        return {"status": "offline", "message": f"Database Error: {str(e)}"}
