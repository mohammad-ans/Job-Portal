"""
Test configuration.

Uses a dedicated test database (gradmatch_test).  Each test receives a
DB session that is rolled back afterwards so tests are isolated.
"""
import os
import pytest
import httpx
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.session import SessionLocal
from app.core.deps import get_db
from app.core.security import hash_password
from app.main import app

TEST_DB_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg2://gradmatch:gradmatch@localhost:5432/gradmatch_test",
)
ADMIN_DB_URL = os.getenv(
    "ADMIN_DATABASE_URL",
    "postgresql+psycopg2://gradmatch:gradmatch@localhost:5432/gradmatch",
)


# ── create test DB if it doesn't exist ───────────────────────────────────────

def _ensure_test_db() -> None:
    admin_engine = create_engine(ADMIN_DB_URL, isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = 'gradmatch_test'")
        ).fetchone()
        if not exists:
            conn.execute(text("CREATE DATABASE gradmatch_test"))
    admin_engine.dispose()


# ── session-scoped engine + schema ───────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def test_engine():
    _ensure_test_db()
    engine = create_engine(TEST_DB_URL)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


# ── per-test transactional session ───────────────────────────────────────────

@pytest.fixture
def db(test_engine):
    connection = test_engine.connect()
    transaction = connection.begin()
    TestSession = sessionmaker(bind=connection, autoflush=False, autocommit=False)
    session = TestSession()
    yield session
    session.close()
    transaction.rollback()
    connection.close()


# ── httpx async client wired to the FastAPI app ──────────────────────────────

@pytest.fixture
async def client(db):
    def _override():
        yield db

    app.dependency_overrides[get_db] = _override
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


# ── helper: create a user and return their JWT ────────────────────────────────

def _make_user(db, email: str, role: str, company_name: str = None):
    from app.models.user import User, UserRole
    from app.models.student_profile import StudentProfile
    from app.models.employer_profile import EmployerProfile

    user = User(
        email=email,
        password_hash=hash_password("Test1234!"),
        name="Test User",
        role=UserRole(role),
        is_verified=True,
    )
    db.add(user)
    db.flush()

    if role == "student":
        db.add(StudentProfile(user_id=user.id, skills=[]))
    elif role == "employer":
        db.add(EmployerProfile(
            user_id=user.id,
            company_name=company_name or "Test Co",
            is_approved=True,
        ))
    db.flush()
    return user


async def _token(client, email: str, password: str = "Test1234!") -> str:
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.fixture
async def student_token(client, db):
    _make_user(db, "student@test.com", "student")
    db.commit()
    return await _token(client, "student@test.com")


@pytest.fixture
async def employer_token(client, db):
    _make_user(db, "employer@test.com", "employer")
    db.commit()
    return await _token(client, "employer@test.com")


@pytest.fixture
async def admin_token(client, db):
    from app.models.user import User, UserRole
    user = User(
        email="admin@test.com",
        password_hash=hash_password("Test1234!"),
        name="Admin",
        role=UserRole.admin,
    )
    db.add(user)
    db.commit()
    return await _token(client, "admin@test.com")
