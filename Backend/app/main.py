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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure the application_status enum has pending_verification (idempotent)
    from sqlalchemy import text
    try:
        with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
            conn.execute(text(
                "ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'pending_verification'"
            ))
    except Exception:
        pass  # enum type may not exist yet (first run), create_all will create it correctly

    # Create all tables (idempotent — skips existing tables)
    Base.metadata.create_all(bind=engine)
    # Seed demo data if not already present
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

upload_dir = Path(settings.RESUME_UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir.parent)), name="uploads")


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
