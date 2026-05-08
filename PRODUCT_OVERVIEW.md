# GradMatch AI — Product Overview

> An intelligent recruitment platform connecting verified university graduates with employers through AI-powered candidate matching.

---

## What Is GradMatch AI?

GradMatch AI is a web-based job portal built specifically for the graduate recruitment market. Unlike general-purpose job boards, every actor on the platform — students, employers, and job listings — goes through a verification and quality-assurance layer before becoming visible to others. An AI matching engine then ranks candidates against open roles automatically, dramatically reducing the time employers spend screening applicants and increasing the relevance of opportunities that students see.

---

## User Roles

The platform serves three distinct groups, each with a tailored experience.

| Role | Who They Are |
|---|---|
| **Student / Graduate** | University students or recent graduates looking for full-time, part-time, internship, or contract roles |
| **Employer** | Companies posting roles and reviewing AI-ranked candidates |
| **Administrator** | Internal staff who moderate the platform, manage content, and handle support |

---

## Feature Breakdown

### For Students

| Feature | What It Does |
|---|---|
| **Account Registration** | Students sign up with their name, email, and password. The account is held in a pending state until identity is verified by an administrator. |
| **Identity Verification** | Admin reviews the student's profile and approves or rejects it. If rejected, the student receives a reason and may re-submit for review once. A second rejection permanently closes the account. Only verified students appear in employer candidate pipelines. |
| **Profile Builder** | Students fill in their university, degree, graduation year, GPA, skills, and a short bio. |
| **Resume Upload** | Students upload a PDF résumé. The platform automatically extracts and indexes skills from the document to power AI matching. |
| **Profile Picture** | Students can upload a profile photo. |
| **AI-Matched Job Feed** | The student's dashboard shows jobs ranked by AI match score. Each card displays the company, location, job type, salary, match percentage, and — where applicable — how many candidates have already been hired for that role, giving students a live signal of employer activity. |
| **One-Click Apply** | Students apply to a job with a single click. If their identity is still being verified, the application is held in a *Pending Verification* state and becomes active automatically once approved. |
| **Application Tracker** | A dedicated page shows every application the student has submitted, along with its current status (Pending Verification → Applied → Shortlisted → Hired / Rejected). |
| **Password Change** | Students can change their password from within their profile at any time. |
| **Password Reset** | Students who forget their password can request a reset link via email. A time-limited token is sent through Resend; following the link lets the student set a new password securely. |

---

### For Employers

| Feature | What It Does |
|---|---|
| **Account Registration** | Employers sign up with their name, email, password, and company name. The company is held pending until verified by an administrator. |
| **Company Verification** | Admin reviews and approves the company before it can post any jobs. |
| **Company Profile** | Employers complete their company profile: industry, size, website, location, and description. |
| **Job Posting** | Employers post roles specifying title, location, job type (full-time / part-time / internship / contract), required skills, salary range, and a detailed description. Each posting goes to an admin review queue before going live. |
| **AI Candidate Pipeline** | Once a job is live, the platform automatically ranks all matching student profiles by AI score. Employers see a sorted list without having to search manually. |
| **Candidate Profiles** | Each candidate card shows name, university, GPA, skills, an AI-generated executive summary, and a résumé snippet — enough to assess fit at a glance. |
| **Candidate Management** | Employers manage candidates across three tabs: **Pending Review** (all AI-matched and applied candidates), **Shortlisted**, and **Hired**. Each candidate is badged as *Applied* (explicitly applied) or *AI Suggested* (surfaced by the matching engine). From Pending, employers can Shortlist or Reject; from Shortlisted, they can Mark as Hired. Rejected candidates are tracked and their count is shown in the sidebar — they are not permanently deleted. |
| **Pipeline Statistics** | The employer sidebar shows live counts for the selected job: Active Jobs, Shortlisted, Hired, and Rejected candidates. A Pipeline Overview card shows aggregate totals across all posted roles. |
| **Multi-Job Management** | Employers with multiple active roles can switch between them from the same dashboard. |

---

### For Administrators

| Feature | What It Does |
|---|---|
| **Platform Statistics** | Live counts of verified students, verified employers, active job listings, and total hires. The same stats are exposed on the public Home page so visitors see real platform numbers. |
| **Moderation Queue** | A central inbox of pending approvals — student identity verifications, company registrations, and job postings. Admins approve or reject each item individually. Each item shows an AI-generated confidence score to assist the decision. |
| **System Activity Log** | A real-time log of all significant platform actions (approvals, rejections, anomalies). |
| **Company Explorer** | A full list of every registered company. Admins can expand any company to see all applications submitted to its jobs, including candidate details and current status. |
| **Support Tickets** | Every message sent through the Contact Admin form creates a ticket. Admins see all tickets, can read the full message, and update each ticket's status: **Open → In Progress → Resolved**. Tickets can be filtered by status. |
| **FAQ Management** | Admins can add, edit, and delete entries in the Help Center FAQ. Each FAQ entry has a question, a detailed answer, a category, and a display-order index. Changes appear immediately in the public Help Center. |
| **Create Admin Accounts** | Administrators can create additional admin accounts directly from the dashboard, without going through the normal sign-up flow. |

---

### Platform-Wide Features

| Feature | What It Does |
|---|---|
| **Help Center** | A publicly accessible, searchable FAQ page grouped by category (Getting Started, Resume & Profile, AI Matching, For Employers, Account). Includes quick-start guides for students and employers. |
| **Contact Admin** | Any user (logged in or anonymous) can submit a support request. The form captures name, email, subject, and message. Submissions land in the admin support ticket queue. |
| **Success Stories** | A curated page highlighting successful placements made through the platform. |
| **Pricing Page** | A public page outlining platform plans and pricing for employers. Currently marked as under development — billing functionality is not yet active. |
| **Legal Pages** | Privacy Policy and Terms of Service. |
| **Responsive Design** | The platform works on desktop, tablet, and mobile browsers. |
| **Role-Based Access** | Each user type can only access the pages and data relevant to their role. Attempting to reach a restricted page redirects to the appropriate screen. |
| **Secure Authentication** | Passwords are hashed and never stored in plain text. Sessions use signed tokens that expire automatically. |

---

## AI Features — How They Work

### Semantic Job Matching
When a student uploads their résumé or visits their dashboard, the platform's **Bidirectional Matching Engine** runs. It uses **sentence-transformers** (a BERT-based neural network, `all-MiniLM-L6-v2`) to generate dense vector embeddings of both the student's profile and every active job posting. **Cosine similarity** between these vectors produces a percentage match score that captures semantic meaning — not just keyword overlap. A student who lists "ML engineering" will match a job requiring "machine learning" even without an exact word match. Employers always see the most relevant candidates first; students only see jobs they are genuinely suited for.

### AI Match Explanations
For each of the top-matched jobs, an LLM (served via **OpenRouter**) generates a one-sentence natural-language explanation of *why* the student is a good fit — e.g. *"Strong alignment on Python and data pipelines makes this a solid fit for the ML engineer role."* These explanations are shown on the student's job cards to help them understand the match.

### AI Candidate Summaries
When an employer views their candidate pipeline, each applicant card shows an AI-generated two-sentence executive summary of the candidate — written from the employer's perspective. The LLM synthesises the student's degree, skills, GPA, and résumé into a concise professional profile, saving employers the time of reading raw résumés before deciding whom to shortlist.

### AI Moderation Confidence Score
Every item entering the admin moderation queue — student identity verifications, company registrations, and job postings — receives an **AI confidence score (0–100)** computed by an LLM. The model evaluates completeness, internal consistency, and plausibility of the submission (e.g. whether a claimed university name is realistic, whether job skills match the description). Admins see this score alongside each queue item to prioritise and speed up their review decisions.

---

## Technology Stack

### Frontend (User Interface)
| | |
|---|---|
| **Framework** | React with TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **Routing** | React Router |
| **Build Tool** | Vite |
| **Charts & Icons** | Recharts, Lucide React |

### Backend (Server & Database)
| | |
|---|---|
| **Language** | Python |
| **API Framework** | FastAPI |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy |
| **Authentication** | JWT (JSON Web Tokens) + bcrypt password hashing |
| **Document Parsing** | pdfminer (PDF résumé text extraction) |
| **Data Validation** | Pydantic |
| **Email** | Resend API (Python SDK v2) — password reset emails |

### Deployment
| | |
|---|---|
| **Frontend** | Vercel |
| **Backend + Database** | Railway (FastAPI server and PostgreSQL instance on the same platform) |
| **File Storage** | Railway server filesystem (`/uploads/resumes/`, `/uploads/avatars/`) |

### AI & Machine Learning
| | |
|---|---|
| **Semantic Embeddings** | sentence-transformers (`all-MiniLM-L6-v2`) — BERT-based neural network for dense vector representations |
| **Similarity Scoring** | Cosine similarity between student and job embedding vectors |
| **Text Generation** | OpenRouter API (LLM gateway) — match explanations, candidate summaries, moderation scores |
| **LLM Model** | Configurable; defaults to `mistralai/mistral-7b-instruct` |

---

*Document generated for internal business review. For technical implementation details, refer to the backend and frontend codebases respectively.*
