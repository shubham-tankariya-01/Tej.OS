# The Pact Backend

FastAPI backend for The Pact.

## Setup Instructions

1. Ensure you have `uv` installed.
2. Initialize the environment and install dependencies:
   ```bash
   uv sync
   ```
3. Set up MongoDB Atlas (Free M0 Tier):
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   - Create a free M0 cluster.
   - Go to Database Access and create a new user (save the password).
   - Go to Network Access and allow your IP address.
   - Click "Connect", choose "Connect your application", and copy the connection string.
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Paste your MongoDB connection string into `MONGO_URI` in `.env`, replacing `<username>` and `<password>`.
6. Run the server:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

## Testing

Run tests with `pytest`:
```bash
uv run pytest
```

## File Storage
- **Provider**: MongoDB GridFS (using Motor).
- **Caps**: Uploads are restricted to **10MB per file**, with a maximum limit of **100MB per user** to strictly ensure the app remains fully within the MongoDB Atlas M0 free tier limits.
- **Why**: Keeps all data entirely self-contained without requiring third-party services like Cloudinary.
