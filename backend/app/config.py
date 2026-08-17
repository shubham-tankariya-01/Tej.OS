from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENV: str = "development"
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "the_pact"
    FRONTEND_URL: str = "http://localhost:5173"
    SECRET_KEY: str = "super_secret_key_change_in_prod_123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24h

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
