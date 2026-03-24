import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "swasthya_ai_twin"
    SECRET_KEY: str = "your_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")

settings = Settings()
