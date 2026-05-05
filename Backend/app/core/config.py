from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://gradmatch:gradmatch@localhost:5432/gradmatch"
    JWT_SECRET: str = "change-me-to-32-plus-random-bytes"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRES_HOURS: int = 24
    CORS_ORIGINS: str = "http://localhost:5173"
    RESUME_UPLOAD_DIR: str = "./uploads/resumes"
    MAX_RESUME_MB: int = 5

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
