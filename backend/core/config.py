from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    db_name: str = "tejos"
    
    class Config:
        env_file = ".env"

settings = Settings()
