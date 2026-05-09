# GradMatch AI

An AI-powered graduate recruitment platform that connects verified university students with employers through semantic matching. Every profile, company, and job listing is moderated before going live. The matching engine uses sentence-transformer embeddings and cosine similarity to rank candidates against roles — going beyond keyword counting to capture semantic meaning.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [Deployment](#deployment)

---

## Overview

GradMatch AI solves a specific problem in the graduate recruitment market: fresh graduates struggle to get past generic ATS filters, and employers waste hours screening unqualified applicants. The platform addresses this by:

- Requiring admin verification of all students, employers, and job postings before they become visible.
- Running a bidirectional AI matching engine that automatically surfaces the right candidates for each role — and the right roles for each student.
- Using an LLM (via OpenRouter) to generate human-readable match explanations, candidate summaries, and moderation confidence scores.

---

## Features

### Students

| Feature | Description |
|---|---|
| Account Registration | Sign up and enter a pending verification queue. |
| Identity Verification | Admin approves or rejects the profile with a written reason. One re-submission is allowed; a second rejection permanently closes the account. |
| Profile Builder | University, degree, graduation year, GPA, skills, and bio. |
| Resume Upload | PDF or DOCX. Skills are extracted automatically and merged into the profile to power AI matching. |
| Profile Picture | JPEG, PNG, GIF, or WebP up to 5 MB. |
| AI-Matched Job Feed | Jobs ranked by semantic match score. Each card shows match percentage, why you matched (LLM-generated), how many candidates have already been hired, and required skills highlighted green where the student has them. |
| One-Click Apply | Applying while unverified creates a Pending Verification application that activates automatically on approval. |
| Application Tracker | Dedicated page showing every submitted application and its current status across the full pipeline. |
| Password Change | Available from the profile settings page at any time. |
| Password Reset | Email-based reset via Resend. A time-limited SHA-256 token is sent; the link expires after one hour. |

### Employers

| Feature | Description |
|---|---|
| Account Registration | Sign up with company name. Held pending until an admin approves the company. |
| Company Verification | Full admin review before the company can post any jobs. Rejection includes a written reason. |
| Company Profile | Industry, size, website, location, and description. |
| Job Posting | Title, location, type, required skills, salary range, and description. Each posting enters an admin review queue before going live. Editing a live job re-queues it for review. |
| AI Candidate Pipeline | Once a job is active, all matching student profiles are automatically ranked by AI score. No manual search required. |
| Candidate Cards | Name, university, GPA, skills, AI-generated executive summary (employer perspective), and a resume snippet. |
| Candidate Management | Three tabs: Pending Review, Shortlisted, and Hired. Candidates are badged as Applied (explicitly clicked Apply) or AI Suggested (surfaced by the engine). Actions: Shortlist, Reject, Mark as Hired. |
| Pipeline Statistics | Live sidebar counts: Active Jobs, Shortlisted, Hired, Rejected — for the currently selected job, plus aggregate totals across all roles. |
| Multi-Job Management | Switch between posted roles from the same dashboard. |

### Administrators

| Feature | Description |
|---|---|
| Platform Statistics | Live counts of verified students, verified employers, active jobs, and total hires — also exposed publicly on the home page. |
| Moderation Queue | Unified inbox for pending student verifications, company registrations, and job postings. Each item shows an AI confidence score (0–100) computed by an LLM to assist the reviewer. |
| Approve / Reject | Approvals activate the entity. Rejections require a written reason that is displayed to the user. Student rejections increment a counter; the account is permanently closed after two rejections. |
| System Activity Log | Real-time log of all significant platform events. Polls automatically while the admin is on the queue tab. |
| Company Explorer | Full list of every registered company with expandable application details. |
| Support Tickets | Contact Admin form submissions create tickets. Admins can read, update status (Open, In Progress, Resolved), and filter by status. |
| FAQ Management | Add, edit, and delete Help Center entries. Changes are reflected immediately on the public FAQ page. |
| Create Admin Accounts | Provision additional admin accounts directly from the dashboard, bypassing the normal signup flow. |

### Platform-Wide

| Feature | Description |
|---|---|
| Help Center | Publicly accessible, searchable FAQ grouped by category. |
| Contact Admin | Any visitor can submit a support request; it lands in the admin ticket queue. |
| Success Stories | Curated page of successful placements. |
| Pricing Page | Plans overview page, currently marked as under development. |
| Legal Pages | Privacy Policy and Terms of Service. |
| Responsive Design | Fully functional on desktop, tablet, and mobile. |
| Role-Based Access | Strict route guards; accessing a restricted page redirects to the appropriate screen. |
| Secure Authentication | bcrypt-hashed passwords, signed JWT access tokens with configurable expiry. |

---

## Architecture

```
Users (Student / Employer / Admin)
          |
          | Browser
          v
  Frontend — React + TypeScript (Vercel)
  Student Dashboard | Employer Dashboard | Admin Console
  Application Tracker | Help Center | Auth Pages
          |
          | HTTPS / REST API (JWT Bearer)
          v
  Backend — Python + FastAPI (Railway)
  Auth | Profiles | Jobs | Applications | Admin | FAQ | Content | Password Reset
          |
          | Internal function calls
          v
  AI Services (co-located on Railway)
  Resume Parser (pdfminer)
  Semantic Embeddings (sentence-transformers all-MiniLM-L6-v2)
  Cosine Similarity Matching
  LLM Text Generation (OpenRouter -> mistral-7b-instruct)
  AI Moderation Scoring
          |
     +----+----+----+
     |         |    |
     v         v    v
PostgreSQL  /uploads  External APIs
(Railway)  (Railway   Resend (email)
           filesystem) OpenRouter (LLM)
```

The full diagram is available as [`ARCHITECTURE.svg`](ARCHITECTURE.svg).

---

## Technology Stack

### Frontend

| Component | Technology |
|---|---|
| Framework | React 18 with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Routing | React Router v7 |
| UI Primitives | shadcn/ui (Radix UI) |
| Icons | Lucide React |
| Notifications | Sonner |

### Backend

| Component | Technology |
|---|---|
| Language | Python 3.11+ |
| API Framework | FastAPI |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic + runtime ALTER TABLE on startup |
| Auth | JWT (python-jose) + bcrypt |
| Document Parsing | pdfminer.six, python-docx |
| Validation | Pydantic v2 + pydantic-settings |
| Email | Resend Python SDK v2 |

### AI and Machine Learning

| Component | Technology |
|---|---|
| Semantic Embeddings | sentence-transformers (`all-MiniLM-L6-v2`) |
| Similarity Scoring | Cosine similarity between dense student and job vectors |
| LLM Text Generation | OpenRouter API (OpenAI-compatible), default model `mistralai/mistral-7b-instruct:free` |
| LLM Use Cases | Match explanations, employer-facing candidate summaries, moderation confidence scores |
| Resume Skill Extraction | Vocabulary-based keyword index (skills_vocab) |

### Deployment

| Target | Platform |
|---|---|
| Frontend | Vercel |
| Backend + PostgreSQL | Railway |
| File Storage | Railway server filesystem (`/uploads/`) |

---

## Repository Structure

```
/
├── ARCHITECTURE.svg          System architecture diagram
├── PRODUCT_OVERVIEW.md       Full product and feature documentation
├── README.md
│
├── Backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py     Pydantic-settings configuration (reads .env)
│   │   │   ├── deps.py       FastAPI dependency injectors (DB session, current user)
│   │   │   └── security.py   JWT creation/verification, bcrypt helpers
│   │   ├── db/
│   │   │   ├── base.py       SQLAlchemy declarative base
│   │   │   └── session.py    Engine and SessionLocal factory
│   │   ├── models/           SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── student_profile.py
│   │   │   ├── employer_profile.py
│   │   │   ├── job.py
│   │   │   ├── application.py
│   │   │   ├── approval.py
│   │   │   ├── password_reset_token.py
│   │   │   └── ...
│   │   ├── routers/          FastAPI route handlers (one file per domain)
│   │   │   ├── auth.py       Signup, login, logout, /me
│   │   │   ├── users.py      Profiles, resume upload, avatar, re-verify
│   │   │   ├── jobs.py       CRUD for job postings
│   │   │   ├── applications.py  Apply, track, status updates
│   │   │   ├── matches.py    AI matching, candidate pipeline, employer stats
│   │   │   ├── admin.py      Moderation queue, logs, company explorer, tickets
│   │   │   ├── faq.py        FAQ CRUD
│   │   │   ├── content.py    Public stats, success stories
│   │   │   ├── contact.py    Support tickets
│   │   │   └── password_reset.py  Forgot / reset password
│   │   ├── schemas/          Pydantic request/response models
│   │   ├── services/
│   │   │   ├── ai_client.py      OpenRouter API wrapper (chat + parse_score)
│   │   │   ├── ai_moderator.py   LLM confidence scoring for moderation queue
│   │   │   ├── embeddings.py     sentence-transformers lazy loader + cosine similarity
│   │   │   ├── matcher.py        Bidirectional matching engine
│   │   │   ├── email.py          Resend integration for password reset
│   │   │   ├── resume_parser.py  pdfminer text extraction
│   │   │   └── skills_vocab.py   Keyword-based skill extraction
│   │   ├── main.py           App factory, CORS, router registration, startup migrations
│   │   └── seed.py           Demo data (runs once on first boot)
│   ├── tests/
│   │   ├── conftest.py       Pytest fixtures (test DB, client)
│   │   └── test_auth.py      Auth endpoint tests
│   ├── alembic/              Database migration history
│   ├── Dockerfile
│   ├── docker-compose.yml    Local dev: PostgreSQL + API with hot reload
│   ├── pyproject.toml
│   └── .env.example          All required variables with comments
│
└── Job Project/
    ├── src/
    │   ├── app/
    │   │   ├── components/   Page-level React components
    │   │   │   ├── StudentDashboard.tsx
    │   │   │   ├── EmployerDashboard.tsx
    │   │   │   ├── AdminConsole.tsx
    │   │   │   ├── MyApplications.tsx
    │   │   │   ├── Profile.tsx
    │   │   │   ├── Auth.tsx
    │   │   │   ├── ForgotPassword.tsx
    │   │   │   ├── ResetPassword.tsx
    │   │   │   ├── HelpCenter.tsx
    │   │   │   ├── ContactAdmin.tsx
    │   │   │   ├── Home.tsx
    │   │   │   ├── Pricing.tsx
    │   │   │   └── ui/       shadcn/ui primitives
    │   │   ├── context/
    │   │   │   └── AuthContext.tsx   JWT storage, user state, role helpers
    │   │   ├── lib/
    │   │   │   └── api.ts    Typed fetch wrapper (attaches Bearer token)
    │   │   └── routes.tsx    React Router route definitions
    │   └── main.tsx
    ├── index.html
    ├── package.json
    └── .env.example
```

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose (for the database)

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Job Portal Prototype"
```

### 2. Start the database

```bash
cd Backend
docker compose up db -d
```

This starts a PostgreSQL 16 container on port `5432` with database `gradmatch`, user `gradmatch`, password `gradmatch`.

### 3. Configure the backend environment

```bash
cp .env.example .env
```

Edit `.env` and fill in at minimum:

```
DATABASE_URL=postgresql+psycopg2://gradmatch:gradmatch@localhost:5432/gradmatch
JWT_SECRET=<any-32+-character-random-string>
RESEND_API_KEY=<your-resend-key>
RESEND_FROM=GradMatch AI <noreply@yourdomain.com>
FRONTEND_URL=http://localhost:5173
OPENROUTER_API_KEY=<your-openrouter-key>
```

See [Environment Variables](#environment-variables) for the full list.

### 4. Install backend dependencies and start the server

```bash
pip install -e ".[test]"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On first startup the server:
1. Creates all database tables.
2. Applies any pending `ALTER TABLE` migrations automatically.
3. Inserts demo seed data (three accounts, three jobs, FAQs, success stories).

The API is available at `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

### 5. Configure the frontend environment

```bash
cd "../Job Project"
cp .env.example .env
```

The only variable required for local development is:

```
VITE_API_BASE_URL=http://localhost:8000
```

### 6. Install frontend dependencies and start the dev server

```bash
npm install
npm run dev
```

The application opens at `http://localhost:5173`.

### Alternative: run everything with Docker Compose

```bash
cd Backend
docker compose up --build
```

This starts both the database and the API server together with hot reload enabled.

---

## Environment Variables

All backend variables are documented in [`Backend/.env.example`](Backend/.env.example). The table below summarises each one.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Full SQLAlchemy connection string for PostgreSQL |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens. Must be random and at least 32 characters. |
| `JWT_ALGORITHM` | No | Token signing algorithm. Default: `HS256` |
| `JWT_EXPIRES_HOURS` | No | Token lifetime in hours. Default: `24` |
| `CORS_ORIGINS` | Yes | Comma-separated list of allowed frontend origins |
| `RESUME_UPLOAD_DIR` | No | Path where uploaded resumes are stored. Default: `./uploads/resumes` |
| `MAX_RESUME_MB` | No | Maximum resume file size in megabytes. Default: `5` |
| `RESEND_API_KEY` | Yes | API key from resend.com |
| `RESEND_FROM` | Yes | Verified sending address, e.g. `Name <address@yourdomain.com>` |
| `FRONTEND_URL` | Yes | Public URL of the frontend — embedded in password reset emails |
| `OPENROUTER_API_KEY` | Yes | API key from openrouter.ai |
| `OPENROUTER_MODEL` | No | LLM model identifier. Default: `mistralai/mistral-7b-instruct:free` |

> The AI features (match explanations, candidate summaries, moderation scores) degrade gracefully if `OPENROUTER_API_KEY` is invalid — they fall back to template strings. The application will still start and run.

---

## Demo Credentials

Seed data is inserted automatically on first boot. All demo accounts share the same password.

| Role | Email | Password |
|---|---|---|
| Student | `usman@example.com` | `Demo1234!` |
| Employer | `sarah@nexus.tech` | `Demo1234!` |
| Administrator | `admin@gradmatch.ai` | `Demo1234!` |

The seed creates three active job postings (Junior Software Engineer, Data Analyst Trainee, Frontend Developer) owned by Nexus Tech, plus a set of FAQs, success stories, and sample moderation queue items.

---

## API Reference

The FastAPI server generates interactive documentation automatically.

| Interface | URL |
|---|---|
| Swagger UI | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |
| Health check | `GET http://localhost:8000/health` |

All authenticated endpoints require an `Authorization: Bearer <token>` header. Tokens are obtained from `POST /api/v1/auth/login` or `POST /api/v1/auth/signup`.

### Route Summary

| Prefix | Description |
|---|---|
| `POST /api/v1/auth/signup` | Register a new student or employer account |
| `POST /api/v1/auth/login` | Obtain a JWT access token |
| `GET  /api/v1/auth/me` | Return the currently authenticated user |
| `POST /api/v1/auth/forgot-password` | Request a password reset email |
| `POST /api/v1/auth/reset-password` | Complete a password reset using a token |
| `GET  /api/v1/users/me/profile` | Retrieve the current user's full profile |
| `PATCH /api/v1/users/me/profile` | Update profile fields |
| `POST /api/v1/users/me/resume` | Upload a resume (PDF or DOCX) |
| `POST /api/v1/users/me/avatar` | Upload a profile picture |
| `POST /api/v1/users/me/password` | Change password |
| `POST /api/v1/users/me/re-verify` | Re-submit a rejected student profile for verification |
| `GET  /api/v1/jobs` | List jobs (employers see their own; others see active only) |
| `POST /api/v1/jobs` | Create a job posting (employer, verified company required) |
| `PATCH /api/v1/jobs/{id}` | Edit a job posting (re-queues for admin review) |
| `DELETE /api/v1/jobs/{id}` | Delete a job posting |
| `GET  /api/v1/matches/jobs` | Get AI-ranked job matches for the current student |
| `POST /api/v1/matches/recompute` | Force-recompute matches for the current student |
| `GET  /api/v1/matches/candidates` | Get AI-ranked candidates for a job (employer) |
| `GET  /api/v1/matches/employer-stats` | Aggregate pipeline stats for the current employer |
| `GET  /api/v1/applications/me` | List a student's submitted applications |
| `POST /api/v1/applications` | Apply to a job |
| `PATCH /api/v1/applications/{id}/status` | Update candidate status (employer: shortlist/hire/reject) |
| `GET  /api/v1/admin/stats` | Platform-wide statistics (admin only) |
| `GET  /api/v1/admin/approvals` | Moderation queue (admin only) |
| `POST /api/v1/admin/approvals/{id}/approve` | Approve a queued item |
| `POST /api/v1/admin/approvals/{id}/reject` | Reject a queued item with a reason |
| `GET  /api/v1/admin/logs` | System activity log |
| `GET  /api/v1/admin/companies` | Company explorer |
| `POST /api/v1/admin/create-admin` | Create a new admin account |
| `GET  /api/v1/content/stats` | Public platform statistics (no auth) |
| `GET  /api/v1/content/success-stories` | Public success stories |
| `GET  /api/v1/faq` | List FAQ entries |
| `POST /api/v1/faq` | Create an FAQ entry (admin only) |
| `PATCH /api/v1/faq/{id}` | Update an FAQ entry (admin only) |
| `DELETE /api/v1/faq/{id}` | Delete an FAQ entry (admin only) |
| `POST /api/v1/contact` | Submit a support ticket |
| `GET  /api/v1/contact` | List support tickets (admin only) |
| `PATCH /api/v1/contact/{id}` | Update ticket status (admin only) |

---

## Running Tests

```bash
cd Backend
pytest
```

The test suite uses a separate in-memory SQLite database created per test session. No running PostgreSQL instance is required for tests.

```bash
# Run with verbose output
pytest -v

# Run a specific file
pytest tests/test_auth.py -v
```

---

## Deployment

### Frontend — Vercel

1. Connect the `Job Project/` directory to a Vercel project.
2. Set the build command to `npm run build` and the output directory to `dist`.
3. Add the environment variable `VITE_API_BASE_URL` pointing to your Railway backend URL.

### Backend — Railway

1. Create a Railway project and provision a PostgreSQL database.
2. Deploy the `Backend/` directory. Railway will detect the `Dockerfile` automatically.
3. Set all environment variables listed in the [Environment Variables](#environment-variables) section via the Railway dashboard.
4. Set `CORS_ORIGINS` to your Vercel frontend URL.
5. Set `FRONTEND_URL` to the same Vercel URL (used in password reset emails).
6. The server runs database migrations and seeds demo data on first boot — no manual migration step required.

### Production Checklist

- Generate a cryptographically random `JWT_SECRET` (`openssl rand -hex 32`).
- Verify your sending domain in the Resend dashboard before `RESEND_FROM` will work.
- Set `CORS_ORIGINS` to your exact production frontend domain with no trailing slash.
- Consider moving file uploads to object storage (S3, Cloudflare R2) for persistence across Railway redeploys.

---

*For a detailed breakdown of every feature and the AI implementation, see [`PRODUCT_OVERVIEW.md`](PRODUCT_OVERVIEW.md).*
*For the system architecture diagram, see [`ARCHITECTURE.svg`](ARCHITECTURE.svg).*
