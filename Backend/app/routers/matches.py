from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.deps import get_db, get_current_user
from app.models.student_profile import StudentProfile
from app.models.employer_profile import EmployerProfile
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.schemas.job import JobMatchOut
from app.schemas.application import CandidateMatchOut, CandidateListOut
from app.services.matcher import compute_matches
from app.services import ai_client

router = APIRouter(prefix="/matches", tags=["matches"])


def _desc_snippet(desc: str) -> str:
    if len(desc) > 200:
        return desc[:200].rstrip() + "…"
    return desc


def _resume_preview(text: str | None) -> str:
    if not text:
        return ""
    if len(text) > 300:
        return text[:300].rstrip() + "…"
    return text


def _build_summary_prompt(sp: StudentProfile) -> str:
    name = sp.user.name
    university = sp.university or "unknown university"
    degree = sp.degree or "unknown degree"
    gpa_str = f"{float(sp.gpa):.2f}" if sp.gpa is not None else "not provided"
    skills_str = ", ".join((sp.skills or [])[:10]) or "not listed"
    resume_excerpt = (sp.resume_text or "")[:400] or "not provided"

    return f"""You are a recruitment assistant writing a candidate summary for an employer.

Candidate information:
- University: {university}
- Degree: {degree}
- GPA: {gpa_str}
- Skills: {skills_str}
- Resume excerpt: {resume_excerpt}

Write exactly 2 professional sentences summarizing this candidate for an employer reviewing their profile.
Rules:
- Do not mention the candidate's name
- Only use information provided above — do not invent details
- Be factual and professional
- First sentence: academic background and strongest skills
- Second sentence: practical value or fit for industry roles
- Output only the 2 sentences, no labels, no quotes, no bullet points

Example good output: A software engineering graduate with hands-on experience in Python, React, and REST API development. Demonstrates practical full-stack capability that translates directly to junior developer and backend engineering roles.

Your summary:"""


def _ensure_summary(app: Application, sp: StudentProfile, db: Session) -> str:
    """Return cached ai_summary or generate and store a new one."""
    if app.ai_summary:
        return app.ai_summary

    raw = ai_client.chat(_build_summary_prompt(sp), max_tokens=100, timeout=25.0)
    if raw and len(raw) > 20:
        summary = raw.strip('"\'')
    else:
        # Fallback
        skills_str = ", ".join((sp.skills or [])[:4]) or "various technical skills"
        summary = (
            f"A {sp.degree or 'university'} graduate from {sp.university or 'a recognised institution'} "
            f"with expertise in {skills_str}. "
            "Shows strong academic foundation relevant to the role."
        )

    app.ai_summary = summary
    db.commit()
    return summary


@router.get("/jobs")
def get_job_matches(
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.value != "student":
        raise HTTPException(403, "Only students can view job matches")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Student profile not found")

    applications = compute_matches(profile, db, limit=limit)

    def _hired_count(job_id) -> int:
        return db.query(Application).filter(
            Application.job_id == job_id,
            Application.status == ApplicationStatus.hired,
        ).count()

    return {"items": [
        JobMatchOut(
            id=app.job.id,
            title=app.job.title,
            company=app.job.employer.company_name,
            location=app.job.location,
            job_type=app.job.job_type.value,
            salary_min=app.job.salary_min,
            salary_max=app.job.salary_max,
            description=app.job.description,
            required_skills=list(app.job.required_skills or []),
            status=app.job.status.value,
            created_at=app.job.created_at,
            match_score=float(app.match_score),
            ai_reason=app.ai_reason,
            desc_snippet=_desc_snippet(app.job.description),
            hired_count=_hired_count(app.job.id),
        )
        for app in applications
    ]}


@router.post("/recompute")
def recompute_matches(
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.value != "student":
        raise HTTPException(403, "Only students can recompute matches")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Student profile not found")

    applications = compute_matches(profile, db, limit=limit)

    def _hired_count(job_id) -> int:
        return db.query(Application).filter(
            Application.job_id == job_id,
            Application.status == ApplicationStatus.hired,
        ).count()

    return {"items": [
        JobMatchOut(
            id=app.job.id,
            title=app.job.title,
            company=app.job.employer.company_name,
            location=app.job.location,
            job_type=app.job.job_type.value,
            salary_min=app.job.salary_min,
            salary_max=app.job.salary_max,
            description=app.job.description,
            required_skills=list(app.job.required_skills or []),
            status=app.job.status.value,
            created_at=app.job.created_at,
            match_score=float(app.match_score),
            ai_reason=app.ai_reason,
            desc_snippet=_desc_snippet(app.job.description),
            hired_count=_hired_count(app.job.id),
        )
        for app in applications
    ]}


@router.get("/candidates", response_model=CandidateListOut)
def get_candidates(
    job_id: UUID = Query(...),
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.value != "employer":
        raise HTTPException(403, "Only employers can view candidates")

    profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Employer profile not found")

    job = db.query(Job).filter(Job.id == job_id, Job.employer_id == profile.id).first()
    if not job:
        raise HTTPException(404, "Job not found or not owned by you")

    applications = (
        db.query(Application)
        .filter(
            Application.job_id == job_id,
            Application.status != ApplicationStatus.pending_verification,
        )
        .order_by(Application.match_score.desc())
        .limit(limit)
        .all()
    )

    items = []
    for app in applications:
        sp = app.student
        items.append(CandidateMatchOut(
            application_id=app.id,
            student_id=sp.id,
            name=sp.user.name,
            avatar_url=sp.user.avatar_url,
            university=sp.university,
            gpa=float(sp.gpa) if sp.gpa is not None else None,
            skills=list(sp.skills or []),
            match_score=float(app.match_score),
            status=app.status.value,
            ai_summary=_ensure_summary(app, sp, db),
            resume_preview=_resume_preview(sp.resume_text),
        ))

    return CandidateListOut(items=items)


@router.get("/employer-stats")
def get_employer_stats(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.value != "employer":
        raise HTTPException(403, "Only employers can view employer stats")

    profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Employer profile not found")

    job_ids = [j.id for j in db.query(Job.id).filter(Job.employer_id == profile.id).all()]

    total_candidates = 0
    total_hired = 0
    total_rejected = 0
    if job_ids:
        total_candidates = (
            db.query(Application)
            .filter(
                Application.job_id.in_(job_ids),
                Application.status != ApplicationStatus.matched,
                Application.status != ApplicationStatus.pending_verification,
            )
            .count()
        )
        total_hired = (
            db.query(Application)
            .filter(
                Application.job_id.in_(job_ids),
                Application.status == ApplicationStatus.hired,
            )
            .count()
        )
        total_rejected = (
            db.query(Application)
            .filter(
                Application.job_id.in_(job_ids),
                Application.status == ApplicationStatus.rejected,
            )
            .count()
        )

    return {
        "total_candidates": total_candidates,
        "total_hired": total_hired,
        "total_rejected": total_rejected,
        "total_jobs": len(job_ids),
    }
