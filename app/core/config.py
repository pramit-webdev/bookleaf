from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    OPENAI_API_KEY: str
    
    # Render or environment specific
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()
