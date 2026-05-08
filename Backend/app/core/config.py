from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str
    JWT_EXPIRES_HOURS: int
    CORS_ORIGINS: str
    RESUME_UPLOAD_DIR: str
    MAX_RESUME_MB: int
    RESEND_API_KEY: str
    RESEND_FROM: str
    FRONTEND_URL: str
    OPENROUTER_API_KEY: str
    OPENROUTER_MODEL: str = "mistralai/mistral-7b-instruct:free"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
