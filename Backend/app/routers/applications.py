from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from uuid import UUID

from app.core.deps import get_db, get_current_user
from app.models.application import Application, ApplicationStatus
from app.models.student_profile import StudentProfile
from app.models.employer_profile import EmployerProfile
from app.models.job import Job, JobStatus
from app.schemas.application import ApplicationCreate, ApplicationStatusPatch, ApplicationOut
from app.schemas.job import JobOut
from app.routers.jobs import _job_out

router = APIRouter(prefix="/applications", tags=["applications"])


def _app_out(app: Application) -> ApplicationOut:
    return ApplicationOut(
        id=app.id,
        job_id=app.job_id,
        student_id=app.student_id,
        match_score=float(app.match_score),
        ai_reason=app.ai_reason,
        status=app.status.value,
        created_at=app.created_at,
    )


@router.post("", response_model=ApplicationOut, status_code=201)
def apply_to_job(
    body: ApplicationCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.value != "student":
        raise HTTPException(403, "Only students can apply to jobs")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Student profile not found")

    job = db.query(Job).filter(Job.id == body.job_id, Job.status == JobStatus.active).first()
    if not job:
        raise HTTPException(404, "Job not found or not active")

    existing = (
        db.query(Application)
        .filter(Application.student_id == profile.id, Application.job_id == body.job_id)
        .first()
    )

    if existing:
        existing.status = ApplicationStatus.applied
        db.commit()
        db.refresh(existing)
        return _app_out(existing)

    app = Application(
        student_id=profile.id,
        job_id=body.job_id,
        match_score=Decimal("0"),
        status=ApplicationStatus.applied,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return _app_out(app)


@router.get("/me")
def my_applications(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.value != "student":
        raise HTTPException(403, "Only students can view their applications")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Student profile not found")

    applications = (
        db.query(Application)
        .filter(Application.student_id == profile.id)
        .order_by(Application.created_at.desc())
        .all()
    )

    items = []
    for app in applications:
        items.append({
            **_app_out(app).model_dump(),
            "job": _job_out(app.job).model_dump(),
        })

    return {"items": items}


@router.patch("/{app_id}/status", response_model=ApplicationOut)
def update_application_status(
    app_id: UUID,
    body: ApplicationStatusPatch,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.value != "employer":
        raise HTTPException(403, "Only employers can update application status")

    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(404, "Application not found")

    profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
    if not profile or app.job.employer_id != profile.id:
        raise HTTPException(403, "Not your job")

    allowed = {"shortlisted", "rejected", "hired"}
    if body.status not in allowed:
        raise HTTPException(400, f"Status must be one of: {allowed}")

    app.status = ApplicationStatus(body.status)
    db.commit()
    db.refresh(app)
    return _app_out(app)
