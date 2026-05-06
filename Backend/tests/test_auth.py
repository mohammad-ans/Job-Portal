"""
Authorization matrix tests (§6 of BACKEND_CONTEXT.md).

One test per row — verifies that the correct roles are allowed/blocked.
"""
import pytest


# ── helpers ──────────────────────────────────────────────────────────────────

def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── §6 Row 1: /auth/* — public ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_auth_signup_public(client):
    resp = await client.post("/api/v1/auth/signup", json={
        "name": "New Student",
        "email": "newstudent@test.com",
        "password": "Pass1234!",
        "role": "student",
    })
    assert resp.status_code == 201

@pytest.mark.asyncio
async def test_auth_login_public(client, db):
    from tests.conftest import _make_user
    _make_user(db, "logintest@test.com", "student")
    db.commit()
    resp = await client.post("/api/v1/auth/login", json={
        "email": "logintest@test.com",
        "password": "Test1234!",
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()

@pytest.mark.asyncio
async def test_auth_signup_rejects_admin(client):
    resp = await client.post("/api/v1/auth/signup", json={
        "name": "Hacker",
        "email": "hack@test.com",
        "password": "Pass1234!",
        "role": "admin",
    })
    assert resp.status_code == 400


# ── §6 Row 2: /users/me/* — requires auth ────────────────────────────────────

@pytest.mark.asyncio
async def test_users_me_profile_requires_auth(client):
    resp = await client.get("/api/v1/users/me/profile")
    assert resp.status_code == 403  # HTTPBearer returns 403 when no credentials

@pytest.mark.asyncio
async def test_users_me_profile_student(client, student_token):
    resp = await client.get("/api/v1/users/me/profile", headers=auth(student_token))
    assert resp.status_code == 200
    assert "university" in resp.json()

@pytest.mark.asyncio
async def test_users_me_profile_employer(client, employer_token):
    resp = await client.get("/api/v1/users/me/profile", headers=auth(employer_token))
    assert resp.status_code == 200
    assert "company_name" in resp.json()


# ── §6 Row 3: /users/me/resume — student only ────────────────────────────────

@pytest.mark.asyncio
async def test_resume_upload_employer_blocked(client, employer_token):
    files = {"resume": ("cv.pdf", b"%PDF-1.4 test", "application/pdf")}
    resp = await client.post(
        "/api/v1/users/me/resume", headers=auth(employer_token), files=files
    )
    assert resp.status_code == 403


# ── §6 Row 4: GET /jobs — public (active only) ───────────────────────────────

@pytest.mark.asyncio
async def test_jobs_get_anon_allowed(client):
    resp = await client.get("/api/v1/jobs")
    assert resp.status_code == 200
    assert "items" in resp.json()

@pytest.mark.asyncio
async def test_jobs_get_student(client, student_token):
    resp = await client.get("/api/v1/jobs", headers=auth(student_token))
    assert resp.status_code == 200
    assert "items" in resp.json()


# ── §6 Row 5: POST /jobs — employer only ─────────────────────────────────────

@pytest.mark.asyncio
async def test_jobs_post_student_blocked(client, student_token):
    resp = await client.post("/api/v1/jobs", headers=auth(student_token), json={
        "title": "SWE", "location": "Remote", "job_type": "full_time",
        "description": "desc", "required_skills": [],
    })
    assert resp.status_code == 403

@pytest.mark.asyncio
async def test_jobs_post_employer_allowed(client, employer_token):
    resp = await client.post("/api/v1/jobs", headers=auth(employer_token), json={
        "title": "Test Role", "location": "Remote", "job_type": "full_time",
        "description": "A test job description here.", "required_skills": ["Python"],
    })
    assert resp.status_code == 201
    assert resp.json()["status"] == "pending"


# ── §6 Row 6: /matches/jobs — student only ───────────────────────────────────

@pytest.mark.asyncio
async def test_matches_jobs_employer_blocked(client, employer_token):
    resp = await client.get("/api/v1/matches/jobs", headers=auth(employer_token))
    assert resp.status_code == 403

@pytest.mark.asyncio
async def test_matches_jobs_student_allowed(client, student_token):
    resp = await client.get("/api/v1/matches/jobs", headers=auth(student_token))
    assert resp.status_code == 200


# ── §6 Row 7: /matches/candidates — employer only ────────────────────────────

@pytest.mark.asyncio
async def test_matches_candidates_student_blocked(client, student_token):
    resp = await client.get(
        "/api/v1/matches/candidates",
        headers=auth(student_token),
        params={"job_id": "00000000-0000-0000-0000-000000000000"},
    )
    assert resp.status_code == 403


# ── §6 Row 8: /applications — student posts, employer patches ────────────────

@pytest.mark.asyncio
async def test_applications_employer_cannot_post(client, employer_token):
    resp = await client.post("/api/v1/applications", headers=auth(employer_token), json={
        "job_id": "00000000-0000-0000-0000-000000000000"
    })
    assert resp.status_code == 403


# ── §6 Row 9: /admin/* — admin only ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_stats_student_blocked(client, student_token):
    resp = await client.get("/api/v1/admin/stats", headers=auth(student_token))
    assert resp.status_code == 403

@pytest.mark.asyncio
async def test_admin_stats_employer_blocked(client, employer_token):
    resp = await client.get("/api/v1/admin/stats", headers=auth(employer_token))
    assert resp.status_code == 403

@pytest.mark.asyncio
async def test_admin_stats_admin_allowed(client, admin_token):
    resp = await client.get("/api/v1/admin/stats", headers=auth(admin_token))
    assert resp.status_code == 200
    data = resp.json()
    assert "verified_students" in data


# ── §6 Row 10: /content/* — public ───────────────────────────────────────────

@pytest.mark.asyncio
async def test_content_success_stories_public(client):
    resp = await client.get("/api/v1/content/success-stories")
    assert resp.status_code == 200
    assert "items" in resp.json()
