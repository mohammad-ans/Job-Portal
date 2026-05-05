# GradMatch AI — Backend Implementation Context

**Stack:** FastAPI · SQLAlchemy 2.x (ORM) · PostgreSQL · Pydantic v2 · Alembic (migrations) · python-jose (JWT) · passlib[bcrypt]

This document is the single source of truth for the backend. It is derived directly from the frontend prototype's dummy data and mock functions. Implement exactly what is described — field names, types, endpoints, and response shapes must match so the frontend can be wired up by swapping mock calls for HTTP calls without changing any UI code.

---

## 1. Project Layout (required)

```
backend/
├── app/
│   ├── main.py                 # FastAPI app, CORS, router includes
│   ├── core/
│   │   ├── config.py           # Settings (DATABASE_URL, JWT_SECRET, etc.)
│   │   ├── security.py         # password hash, JWT encode/decode
│   │   └── deps.py             # get_db, get_current_user, require_role
│   ├── db/
│   │   ├── base.py             # SQLAlchemy Base, engine, SessionLocal
│   │   └── session.py
│   ├── models/                 # SQLAlchemy ORM models (Section 3)
│   │   ├── user.py
│   │   ├── student_profile.py
│   │   ├── employer_profile.py
│   │   ├── job.py
│   │   ├── application.py
│   │   ├── approval.py
│   │   ├── success_story.py
│   │   └── system_log.py
│   ├── schemas/                # Pydantic v2 request/response models (Section 4)
│   ├── routers/                # FastAPI routers (Section 5)
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── jobs.py
│   │   ├── matches.py
│   │   ├── applications.py
│   │   ├── admin.py
│   │   └── content.py
│   └── services/
│       └── matcher.py          # resume → job matching logic
├── alembic/                    # migrations
└── pyproject.toml
```

---

## 2. Conventions (non-negotiable)

- **IDs:** UUID v4, serialized as string. Column type `UUID(as_uuid=True)`. JSON field name: `id`.
- **Timestamps:** `created_at`, `updated_at` — `TIMESTAMP WITH TIME ZONE`, UTC, ISO-8601 in JSON.
- **Casing:** snake_case in DB and JSON. The frontend currently uses some camelCase (`matchScore`, `aiReason`); the backend MUST return snake_case (`match_score`, `ai_reason`) and the frontend will be updated to match.
- **Auth:** JWT Bearer in `Authorization: Authorization: Bearer <token>`. Token payload: `{ "sub": user_id, "role": role, "exp": ... }`. Expiry 24h.
- **Roles:** Postgres ENUM `user_role` with values `student`, `employer`, `admin`.
- **Errors:** standard FastAPI HTTPException. Body: `{ "detail": "<message>" }`. Validation errors use FastAPI default 422.
- **Pagination:** query params `?limit=20&offset=0`. Responses for list endpoints: `{ "items": [...], "total": <int>, "limit": <int>, "offset": <int> }`.
- **CORS:** allow the frontend origin, `allow_credentials=True`, all standard methods.
- **Soft data:** `deleted_at` is NOT used. Hard delete only where specified.

---

## 3. Database Schema (SQLAlchemy + Postgres)

### 3.1 `users`
Primary identity table for all three roles.

| Column          | Type                       | Constraints                          |
|-----------------|----------------------------|--------------------------------------|
| id              | UUID                       | PK, default uuid4                    |
| email           | VARCHAR(255)               | UNIQUE, NOT NULL, indexed            |
| password_hash   | VARCHAR(255)               | NOT NULL                             |
| name            | VARCHAR(120)               | NOT NULL                             |
| role            | ENUM user_role             | NOT NULL                             |
| avatar_url      | VARCHAR(500)               | NULLABLE                             |
| is_verified     | BOOLEAN                    | NOT NULL, default FALSE              |
| created_at      | TIMESTAMPTZ                | NOT NULL, default now()              |
| updated_at      | TIMESTAMPTZ                | NOT NULL, default now(), on update   |

Relationships: 1—1 `student_profile` (if role=student), 1—1 `employer_profile` (if role=employer), 1—N `applications` (as student), 1—N `jobs` (as employer poster).

### 3.2 `student_profiles`
Created automatically when a user signs up with `role=student`.

| Column          | Type                | Constraints                            |
|-----------------|---------------------|----------------------------------------|
| id              | UUID                | PK                                     |
| user_id         | UUID                | FK users.id, UNIQUE, ON DELETE CASCADE |
| university      | VARCHAR(200)        | NULLABLE                               |
| degree          | VARCHAR(120)        | NULLABLE                               |
| graduation_year | INTEGER             | NULLABLE                               |
| gpa             | NUMERIC(3,2)        | NULLABLE                               |
| skills          | TEXT[]              | NOT NULL, default `{}`                 |
| resume_url      | VARCHAR(500)        | NULLABLE                               |
| resume_text     | TEXT                | NULLABLE (extracted plain text)        |
| bio             | TEXT                | NULLABLE                               |
| is_approved     | BOOLEAN             | NOT NULL, default FALSE                |
| created_at      | TIMESTAMPTZ         | NOT NULL                               |
| updated_at      | TIMESTAMPTZ         | NOT NULL                               |

### 3.3 `employer_profiles`

| Column            | Type           | Constraints                            |
|-------------------|----------------|----------------------------------------|
| id                | UUID           | PK                                     |
| user_id           | UUID           | FK users.id, UNIQUE, ON DELETE CASCADE |
| company_name      | VARCHAR(200)   | NOT NULL                               |
| company_website   | VARCHAR(500)   | NULLABLE                               |
| company_size      | VARCHAR(50)    | NULLABLE                               |
| industry          | VARCHAR(120)   | NULLABLE                               |
| description       | TEXT           | NULLABLE                               |
| is_approved       | BOOLEAN        | NOT NULL, default FALSE                |
| created_at        | TIMESTAMPTZ    | NOT NULL                               |
| updated_at        | TIMESTAMPTZ    | NOT NULL                               |

### 3.4 `jobs`

| Column          | Type                  | Constraints                                      |
|-----------------|-----------------------|--------------------------------------------------|
| id              | UUID                  | PK                                               |
| employer_id     | UUID                  | FK employer_profiles.id, ON DELETE CASCADE       |
| title           | VARCHAR(200)          | NOT NULL                                         |
| location        | VARCHAR(120)          | NOT NULL                                         |
| job_type        | ENUM job_type         | NOT NULL — `full_time`,`part_time`,`internship`,`contract` |
| salary_min      | INTEGER               | NULLABLE (annual, USD)                           |
| salary_max      | INTEGER               | NULLABLE                                         |
| description     | TEXT                  | NOT NULL                                         |
| required_skills | TEXT[]                | NOT NULL, default `{}`                           |
| status          | ENUM job_status       | NOT NULL — `pending`,`active`,`rejected`,`closed`; default `pending` |
| created_at      | TIMESTAMPTZ           | NOT NULL                                         |
| updated_at      | TIMESTAMPTZ           | NOT NULL                                         |

Index: `(status)`, `(employer_id)`.

### 3.5 `applications`
A student applying to (or being matched with) a job. Also stores the cached match score.

| Column        | Type                    | Constraints                              |
|---------------|-------------------------|------------------------------------------|
| id            | UUID                    | PK                                       |
| student_id    | UUID                    | FK student_profiles.id, ON DELETE CASCADE|
| job_id        | UUID                    | FK jobs.id, ON DELETE CASCADE            |
| match_score   | NUMERIC(5,2)            | NOT NULL (0.00–100.00)                   |
| ai_reason     | TEXT                    | NULLABLE                                 |
| status        | ENUM application_status | NOT NULL — `matched`,`applied`,`shortlisted`,`rejected`,`hired`; default `matched` |
| created_at    | TIMESTAMPTZ             | NOT NULL                                 |
| updated_at    | TIMESTAMPTZ             | NOT NULL                                 |

UNIQUE constraint on `(student_id, job_id)`.

### 3.6 `approvals`
Admin moderation queue. Polymorphic — references either an employer registration, a job, or a student verification.

| Column         | Type                | Constraints                                              |
|----------------|---------------------|----------------------------------------------------------|
| id             | UUID                | PK                                                       |
| target_type    | ENUM approval_type  | NOT NULL — `company`,`job`,`student_verification`        |
| target_id      | UUID                | NOT NULL (FK enforced in application layer)              |
| name           | VARCHAR(200)        | NOT NULL (display label)                                 |
| details        | TEXT                | NULLABLE                                                 |
| ai_confidence  | NUMERIC(5,2)        | NOT NULL (0–100)                                         |
| flags          | INTEGER             | NOT NULL, default 0                                      |
| flag_reason    | TEXT                | NULLABLE                                                 |
| status         | ENUM approval_status| NOT NULL — `pending`,`approved`,`rejected`; default `pending` |
| reviewed_by    | UUID                | FK users.id, NULLABLE                                    |
| reviewed_at    | TIMESTAMPTZ         | NULLABLE                                                 |
| created_at     | TIMESTAMPTZ         | NOT NULL                                                 |

When an approval is `approved`/`rejected`, the related row's `is_approved` / `status` field MUST be updated in the same transaction.

### 3.7 `success_stories`
Public testimonial content shown on the marketing page.

| Column     | Type                | Constraints                                  |
|------------|---------------------|----------------------------------------------|
| id         | UUID                | PK                                           |
| name       | VARCHAR(120)        | NOT NULL                                     |
| role_text  | VARCHAR(120)        | NOT NULL (e.g., "Junior Software Engineer")  |
| company    | VARCHAR(120)        | NOT NULL                                     |
| story_type | ENUM story_type     | NOT NULL — `student`,`employer`              |
| content    | TEXT                | NOT NULL                                     |
| image_url  | VARCHAR(500)        | NULLABLE                                     |
| created_at | TIMESTAMPTZ         | NOT NULL                                     |

### 3.8 `system_logs`
Lightweight audit log surfaced on the admin console.

| Column     | Type           | Constraints                |
|------------|----------------|----------------------------|
| id         | UUID           | PK                         |
| event      | VARCHAR(200)   | NOT NULL                   |
| actor_id   | UUID           | FK users.id, NULLABLE      |
| metadata   | JSONB          | NULLABLE                   |
| created_at | TIMESTAMPTZ    | NOT NULL, indexed DESC     |

---

## 4. Pydantic Response Schemas (canonical JSON shapes)

These are the shapes the frontend expects. Field names are FINAL.

### 4.1 `UserOut`
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "student | employer | admin",
  "avatar_url": "string | null",
  "is_verified": true,
  "created_at": "iso-8601"
}
```

### 4.2 `AuthResponse` (login + signup)
```json
{
  "access_token": "jwt",
  "token_type": "bearer",
  "user": { ...UserOut }
}
```

### 4.3 `StudentProfileOut`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",            // joined from users
  "email": "string",           // joined from users
  "avatar_url": "string|null", // joined from users
  "university": "string|null",
  "degree": "string|null",
  "graduation_year": 2026,
  "gpa": 3.85,
  "skills": ["React","Python"],
  "resume_url": "string|null",
  "bio": "string|null",
  "is_approved": false
}
```

### 4.4 `EmployerProfileOut`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "email": "string",
  "company_name": "string",
  "company_website": "string|null",
  "company_size": "string|null",
  "industry": "string|null",
  "description": "string|null",
  "is_approved": false
}
```

### 4.5 `JobOut` (public/student-facing)
```json
{
  "id": "uuid",
  "title": "string",
  "company": "string",          // employer.company_name
  "location": "string",
  "job_type": "full_time|part_time|internship|contract",
  "salary_min": 50000,
  "salary_max": 70000,
  "description": "string",
  "required_skills": ["..."],
  "status": "pending|active|rejected|closed",
  "created_at": "iso-8601"
}
```

### 4.6 `JobMatchOut` (returned by `/matches/jobs` for students)
Extends `JobOut` with:
```json
{
  ...JobOut,
  "match_score": 94.0,
  "ai_reason": "Strong match on React, TypeScript and 2 years internship experience.",
  "desc_snippet": "string"
}
```

### 4.7 `CandidateMatchOut` (returned by `/matches/candidates` for employers)
```json
{
  "application_id": "uuid",
  "student_id": "uuid",
  "name": "string",
  "avatar_url": "string|null",
  "university": "string|null",
  "gpa": 3.85,
  "skills": ["..."],
  "match_score": 98.0,
  "status": "matched|applied|shortlisted|rejected|hired",
  "ai_summary": "string",
  "resume_preview": "string"
}
```

### 4.8 `ApprovalOut`
```json
{
  "id": "uuid",
  "target_type": "company|job|student_verification",
  "target_id": "uuid",
  "name": "string",
  "details": "string|null",
  "ai_confidence": 98.0,
  "flags": 0,
  "flag_reason": "string|null",
  "status": "pending|approved|rejected",
  "created_at": "iso-8601"
}
```

### 4.9 `SuccessStoryOut`, `SystemLogOut`, `AdminStatsOut`
```json
// SuccessStoryOut
{ "id":"uuid","name":"string","role_text":"string","company":"string","story_type":"student|employer","content":"string","image_url":"string|null" }

// SystemLogOut
{ "id":"uuid","event":"string","actor_id":"uuid|null","metadata":{},"created_at":"iso-8601" }

// AdminStatsOut
{ "verified_students": 12504, "verified_employers": 842, "active_jobs": 3190, "total_matches": 45200 }
```

---

## 5. API Endpoints

All routes prefixed with `/api/v1`. Auth header required except where noted.

### 5.1 Auth — `/auth` (public)

| Method | Path             | Body                                                                 | Returns          | Notes |
|--------|------------------|----------------------------------------------------------------------|------------------|-------|
| POST   | `/auth/signup`   | `{ name, email, password, role: "student"\|"employer", company_name? }` | `AuthResponse` 201 | Creates `users` row + role-specific profile row in one transaction. `company_name` required if role=employer. New users start `is_verified=false`. Also creates a pending `approvals` row (`target_type=company` or `student_verification`). |
| POST   | `/auth/login`    | `{ email, password }`                                                | `AuthResponse` 200 | 401 on bad credentials. |
| POST   | `/auth/logout`   | — (auth required)                                                    | `204`            | Stateless JWT — endpoint exists for client symmetry; no server state changes. |
| GET    | `/auth/me`       | — (auth required)                                                    | `UserOut` 200    | |

Replaces frontend: `AuthContext.login`, `logout`, demo logins in `Auth.tsx`.

### 5.2 Users / Profile — `/users`

| Method | Path                    | Auth          | Body / Query                      | Returns                                    |
|--------|-------------------------|---------------|-----------------------------------|--------------------------------------------|
| GET    | `/users/me/profile`     | any role      | —                                 | `StudentProfileOut` or `EmployerProfileOut` (depends on role); admin returns `UserOut` only. |
| PATCH  | `/users/me/profile`     | student/employer | Partial profile (any updatable field except `is_approved`) | Updated profile object |
| POST   | `/users/me/resume`      | student       | `multipart/form-data` file field `resume` (PDF/DOCX, ≤5MB) | `{ resume_url, resume_text, skills_extracted: ["..."] }` 200 — also updates `student_profiles.resume_text` and merges into `skills` |

Replaces: `updateProfile` in `AuthContext`, `handleSave` in `Profile.tsx`, `simulateAnalysis` upload portion in `StudentDashboard`.

### 5.3 Jobs — `/jobs`

| Method | Path              | Auth      | Body / Query                                   | Returns |
|--------|-------------------|-----------|------------------------------------------------|---------|
| GET    | `/jobs`           | any (incl. anon) | `?status=active&q=&limit=&offset=`        | `{ items: JobOut[], total, limit, offset }` — anonymous and students see only `status=active`. Employers see only their own (any status). |
| GET    | `/jobs/{job_id}`  | any       | —                                              | `JobOut` |
| POST   | `/jobs`           | employer  | `{ title, location, job_type, salary_min?, salary_max?, description, required_skills: [] }` | `JobOut` 201 with `status=pending`. Creates `approvals` row (`target_type=job`). |
| PATCH  | `/jobs/{job_id}`  | employer (owner) | Partial job fields                       | `JobOut` — editing a job resets `status` to `pending` and creates a new approval. |
| DELETE | `/jobs/{job_id}`  | employer (owner) or admin | —                              | `204` |

Replaces: `handlePostJob` in `EmployerDashboard.tsx`.

### 5.4 Matches — `/matches`

The "Resume-to-job matcher" is implemented in `app/services/matcher.py`. Algorithm (v1, deterministic, no external ML):

1. Tokenize `student.skills` and `student.resume_text` → set `S`.
2. For each candidate `job` (status=active), compute set `J = job.required_skills`.
3. `score = round( 100 * |S ∩ J| / max(|J|, 1), 2 )`. Bonus +5 if `student.gpa >= 3.5`, capped at 100.
4. `ai_reason` = templated string listing top 3 overlapping skills.
5. Persist top N to `applications` with `status=matched` (idempotent via UNIQUE).

| Method | Path                              | Auth      | Query                                          | Returns |
|--------|-----------------------------------|-----------|------------------------------------------------|---------|
| GET    | `/matches/jobs`                   | student   | `?limit=20`                                    | `{ items: JobMatchOut[] }` sorted desc by `match_score`. |
| POST   | `/matches/recompute`              | student   | —                                              | Same as above. Forces recomputation against latest resume/skills. |
| GET    | `/matches/candidates`             | employer  | `?job_id=<uuid>&limit=20`                      | `{ items: CandidateMatchOut[] }` for the given job, owned by caller. |

Replaces: `MOCK_JOBS` in `StudentDashboard.tsx`, `MOCK_APPLICANTS` in `EmployerDashboard.tsx`.

### 5.5 Applications — `/applications`

| Method | Path                                  | Auth     | Body                                | Returns |
|--------|---------------------------------------|----------|-------------------------------------|---------|
| POST   | `/applications`                       | student  | `{ job_id }`                        | `Application` 201 — sets status=`applied` (upserts on existing match row). |
| GET    | `/applications/me`                    | student  | —                                   | List of own applications joined with job info. |
| PATCH  | `/applications/{id}/status`           | employer (owns job) | `{ status: "shortlisted"\|"rejected"\|"hired" }` | Updated row. |

### 5.6 Admin — `/admin` (auth: admin)

| Method | Path                              | Body                          | Returns |
|--------|-----------------------------------|-------------------------------|---------|
| GET    | `/admin/stats`                    | —                             | `AdminStatsOut` |
| GET    | `/admin/approvals`                | `?status=pending&type=`       | `{ items: ApprovalOut[], total, limit, offset }` |
| POST   | `/admin/approvals/{id}/approve`   | —                             | `ApprovalOut` — also flips the target row's `is_approved`/`status` and writes a `system_logs` entry. |
| POST   | `/admin/approvals/{id}/reject`    | `{ reason?: string }`         | `ApprovalOut` |
| GET    | `/admin/logs`                     | `?limit=50`                   | `{ items: SystemLogOut[] }` |

Replaces: `handleAction` and the metrics + logs blocks in `AdminConsole.tsx`.

### 5.7 Public Content — `/content` (no auth)

| Method | Path                       | Returns |
|--------|----------------------------|---------|
| GET    | `/content/success-stories` | `{ items: SuccessStoryOut[] }` |

Replaces: hardcoded array in `SuccessStories.tsx`.

---

## 6. Authorization Matrix

| Endpoint group        | student | employer | admin | anon |
|-----------------------|:-------:|:--------:|:-----:|:----:|
| `/auth/*`             | ✓       | ✓        | ✓     | ✓    |
| `/users/me/*`         | ✓       | ✓        | ✓ (read only) | — |
| `/users/me/resume`    | ✓       | —        | —     | —    |
| `GET /jobs` (active)  | ✓       | ✓ (own)  | ✓     | ✓    |
| `POST /jobs`          | —       | ✓        | —     | —    |
| `PATCH/DELETE /jobs`  | —       | owner    | ✓     | —    |
| `/matches/jobs`       | ✓       | —        | —     | —    |
| `/matches/candidates` | —       | ✓ (owns job) | — | —    |
| `/applications`       | ✓       | ✓ (status only) | — | — |
| `/admin/*`            | —       | —        | ✓     | —    |
| `/content/*`          | ✓       | ✓        | ✓     | ✓    |

Implement via `Depends(require_role("admin"))` style helpers in `core/deps.py`.

---

## 7. Seed Data (must be inserted on first migration)

To preserve the prototype demo, seed the following (UUIDs may be regenerated, names/emails verbatim):

**Users** (password for all: `Demo1234!`):
- Student: `usman@example.com`, name "Usman Tariq"
- Employer: `sarah@nexus.tech`, name "Sarah Jenkins", company "Nexus Tech"
- Admin: `admin@gradmatch.ai`, name "System Admin"

**Jobs** (under Sarah's employer profile, status=`active`):
1. Junior Software Engineer @ TechFlow Solutions
2. Data Analyst Trainee @ QuantCorp
3. Frontend Developer @ Creative Designs Inc.
   (Use realistic skills arrays so the matcher returns scores around 94/82/78.)

**Approvals** (status=`pending`):
1. Company: "Quantum Analytics", `ai_confidence=98`, `flags=0`
2. Job: "Data Scientist", `ai_confidence=100`, `flags=0`
3. Student verification: "Hassan Ali", `ai_confidence=65`, `flags=2`, `flag_reason="Inconsistent university record"`

**Success stories**: 3 entries — Ahmed Raza (student), Sarah Jenkins (employer), Usman Tariq (student) — copy `content` from `SuccessStories.tsx:4-29`.

**Admin stats** are computed live (counts on `users`, `jobs`, `applications`) — do NOT seed.

---

## 8. Environment Variables

```
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/gradmatch
JWT_SECRET=<32+ random bytes>
JWT_ALGORITHM=HS256
JWT_EXPIRES_HOURS=24
CORS_ORIGINS=http://localhost:5173
RESUME_UPLOAD_DIR=./uploads/resumes
MAX_RESUME_MB=5
```

---

## 9. Acceptance Checklist

A backend implementation is complete when:

- [ ] All tables in §3 exist via Alembic migration `0001_init`.
- [ ] All endpoints in §5 return the exact JSON shapes in §4.
- [ ] Signup creates the role-specific profile AND a pending approval atomically.
- [ ] Approving a `company` approval flips `employer_profiles.is_approved=true`; approving a `job` flips `jobs.status='active'`; approving a `student_verification` flips `student_profiles.is_approved=true`. All write a `system_logs` row.
- [ ] `/matches/jobs` returns descending-sorted scores; the demo student gets ≥1 result with score ≥90 against seeded jobs.
- [ ] JWT auth + role guards enforce the matrix in §6 (verified with tests).
- [ ] Seed data from §7 loads via `alembic upgrade head` + `python -m app.seed`.
- [ ] OpenAPI docs render at `/docs` and every endpoint has request/response examples.
- [ ] CORS allows the frontend dev origin.

When this checklist passes, the frontend can be wired up by replacing each mock function listed in §5's "Replaces" notes with a `fetch` call to the corresponding endpoint — no UI changes required beyond renaming a handful of camelCase fields to snake_case.
