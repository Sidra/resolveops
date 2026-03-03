from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Load .env.local from project root
_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(_root, ".env.local"))


class Settings(BaseSettings):
    WORKER_PORT: int = 3102
    REDIS_URL: str = "redis://localhost:6380"
    LLM_PROVIDER: str = "gemini"


settings = Settings()
