from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.deps import get_db, get_current_user
from app.models.student_profile import StudentProfile
from app.models.employer_profile import EmployerProfile
from app.models.job import Job, JobStatus
from app.models.application import Application
from app.schemas.job import JobMatchOut
from app.schemas.application import CandidateMatchOut, CandidateListOut
from app.services.matcher import compute_matches

router = APIRouter(prefix="/matches", tags=["matches"])


def _desc_snippet(desc: str) -> str:
    if len(desc) > 200:
        return desc[:200].rstrip() + "..."
    return desc


def _resume_preview(text: str | None) -> str:
    if not text:
        return ""
    if len(text) > 300:
        return text[:300].rstrip() + "..."
    return text


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

    items = []
    for app in applications:
        job = app.job
        items.append(
            JobMatchOut(
                id=job.id,
                title=job.title,
                company=job.employer.company_name,
                location=job.location,
                job_type=job.job_type.value,
                salary_min=job.salary_min,
                salary_max=job.salary_max,
                description=job.description,
                required_skills=list(job.required_skills or []),
                status=job.status.value,
                created_at=job.created_at,
                match_score=float(app.match_score),
                ai_reason=app.ai_reason,
                desc_snippet=_desc_snippet(job.description),
            )
        )

    return {"items": items}


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

    items = []
    for app in applications:
        job = app.job
        items.append(
            JobMatchOut(
                id=job.id,
                title=job.title,
                company=job.employer.company_name,
                location=job.location,
                job_type=job.job_type.value,
                salary_min=job.salary_min,
                salary_max=job.salary_max,
                description=job.description,
                required_skills=list(job.required_skills or []),
                status=job.status.value,
                created_at=job.created_at,
                match_score=float(app.match_score),
                ai_reason=app.ai_reason,
                desc_snippet=_desc_snippet(job.description),
            )
        )

    return {"items": items}


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
        .filter(Application.job_id == job_id)
        .order_by(Application.match_score.desc())
        .limit(limit)
        .all()
    )

    items = []
    for app in applications:
        sp = app.student
        items.append(
            CandidateMatchOut(
                application_id=app.id,
                student_id=sp.id,
                name=sp.user.name,
                avatar_url=sp.user.avatar_url,
                university=sp.university,
                gpa=float(sp.gpa) if sp.gpa is not None else None,
                skills=list(sp.skills or []),
                match_score=float(app.match_score),
                status=app.status.value,
                ai_summary=app.ai_reason,
                resume_preview=_resume_preview(sp.resume_text),
            )
        )

    return CandidateListOut(items=items)
