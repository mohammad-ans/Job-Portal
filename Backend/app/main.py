from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# Import all models so SQLAlchemy registers them with Base before create_all
import app.models  # noqa: F401

from app.routers import auth, users, jobs, matches, applications, admin, content, faq, contact
from app.routers import password_reset


@asynccontextmanager
async def lifespan(app: FastAPI):
    from sqlalchemy import text
    # Ensure enum values exist (idempotent, must run outside transaction)
    try:
        with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
            conn.execute(text(
                "ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'pending_verification'"
            ))
    except Exception:
        pass

    # Create all tables (idempotent — skips existing tables)
    Base.metadata.create_all(bind=engine)

    # Add new columns to existing tables if they don't exist yet
    _migrations = [
        "ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS rejection_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT",
        "ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS is_closed BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE employer_profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT",
        "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rejection_reason TEXT",
        "ALTER TABLE applications ADD COLUMN IF NOT EXISTS ai_summary TEXT",
        # password_reset_tokens is created by create_all above; this is a no-op safety net
        """CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(64) NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )""",
    ]
    try:
        with engine.connect() as conn:
            for stmt in _migrations:
                conn.execute(text(stmt))
            conn.commit()
    except Exception:
        pass

    from app.seed import seed
    seed()
    yield


app = FastAPI(
    title="GradMatch AI",
    description="Bidirectional AI-powered job matching for fresh graduates.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)
app.include_router(jobs.router, prefix=PREFIX)
app.include_router(matches.router, prefix=PREFIX)
app.include_router(applications.router, prefix=PREFIX)
app.include_router(admin.router, prefix=PREFIX)
app.include_router(content.router, prefix=PREFIX)
app.include_router(faq.router, prefix=PREFIX)
app.include_router(contact.router, prefix=PREFIX)
app.include_router(password_reset.router, prefix=PREFIX)

upload_dir = Path(settings.RESUME_UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir.parent)), name="uploads")


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
