from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

# Load .env.local from project root
_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(_root, ".env.local"))


class Settings(BaseSettings):
    # Ports
    API_PORT: int = 3101

    # Postgres
    POSTGRES_DB: str = "resolveops"
    POSTGRES_USER: str = "resolveops"
    POSTGRES_PASSWORD: str
    POSTGRES_PORT: int = 5436

    # Redis
    REDIS_URL: str = "redis://localhost:6380"

    # LLM
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Auth
    JWT_SECRET: str

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@localhost:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
