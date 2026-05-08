from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, get_optional_user
from app.models.job import Job, JobType, JobStatus
from app.models.employer_profile import EmployerProfile
from app.models.approval import Approval, ApprovalType, ApprovalStatus
from app.schemas.job import JobCreate, JobPatch, JobOut, JobListOut
from app.services import ai_moderator

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _job_out(job: Job) -> JobOut:
    return JobOut(
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
        rejection_reason=job.rejection_reason,
        created_at=job.created_at,
    )


@router.get("", response_model=JobListOut)
def list_jobs(
    status: str = Query("active"),
    q: str = Query(""),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(get_optional_user),
):
    query = db.query(Job).join(EmployerProfile)

    if user is not None and user.role.value == "employer":
        profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
        if not profile:
            raise HTTPException(404, "Employer profile not found")
        query = query.filter(Job.employer_id == profile.id)
    else:
        query = query.filter(Job.status == JobStatus.active)

    if q:
        query = query.filter(Job.title.ilike(f"%{q}%"))

    total = query.count()
    jobs = query.order_by(Job.created_at.desc()).offset(offset).limit(limit).all()

    return JobListOut(
        items=[_job_out(j) for j in jobs],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/public", response_model=JobListOut)
def list_jobs_public(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Job).join(EmployerProfile).filter(Job.status == JobStatus.active)
    total = query.count()
    jobs = query.order_by(Job.created_at.desc()).offset(offset).limit(limit).all()
    return JobListOut(items=[_job_out(j) for j in jobs], total=total, limit=limit, offset=offset)


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str, db: Session = Depends(get_db), _=Depends(get_optional_user)):
    job = db.query(Job).join(EmployerProfile).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    return _job_out(job)


@router.post("", response_model=JobOut, status_code=201)
def create_job(
    body: JobCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role.value != "employer":
        raise HTTPException(403, "Only employers can post jobs")

    profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Employer profile not found")
    if not profile.is_approved:
        raise HTTPException(403, "Your company must be verified by an admin before posting jobs")

    try:
        jtype = JobType(body.job_type)
    except ValueError:
        raise HTTPException(400, f"Invalid job_type: {body.job_type}")

    job = Job(
        employer_id=profile.id,
        title=body.title,
        location=body.location,
        job_type=jtype,
        salary_min=body.salary_min,
        salary_max=body.salary_max,
        description=body.description,
        required_skills=body.required_skills,
        status=JobStatus.pending,
    )
    db.add(job)
    db.flush()

    confidence = ai_moderator.score_job_posting(
        title=body.title,
        company=profile.company_name,
        location=body.location,
        job_type=body.job_type,
        required_skills=body.required_skills,
        description=body.description,
    )
    approval = Approval(
        target_type=ApprovalType.job,
        target_id=job.id,
        name=f"{body.title} @ {profile.company_name}",
        ai_confidence=confidence,
        flags=0,
        status=ApprovalStatus.pending,
    )
    db.add(approval)
    db.commit()
    db.refresh(job)
    return _job_out(job)


@router.patch("/{job_id}", response_model=JobOut)
def update_job(
    job_id: str,
    body: JobPatch,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    job = db.query(Job).join(EmployerProfile).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    if user.role.value == "employer":
        profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
        if not profile or job.employer_id != profile.id:
            raise HTTPException(403, "Not your job")
    elif user.role.value != "admin":
        raise HTTPException(403, "Insufficient permissions")

    for field in ("title", "location", "salary_min", "salary_max", "description"):
        val = getattr(body, field)
        if val is not None:
            setattr(job, field, val)

    if body.job_type is not None:
        try:
            job.job_type = JobType(body.job_type)
        except ValueError:
            raise HTTPException(400, f"Invalid job_type: {body.job_type}")

    if body.required_skills is not None:
        job.required_skills = body.required_skills

    job.status = JobStatus.pending

    confidence = ai_moderator.score_job_posting(
        title=job.title,
        company=job.employer.company_name,
        location=job.location,
        job_type=job.job_type.value,
        required_skills=list(job.required_skills or []),
        description=job.description,
    )
    approval = Approval(
        target_type=ApprovalType.job,
        target_id=job.id,
        name=f"{job.title} @ {job.employer.company_name}",
        ai_confidence=confidence,
        flags=0,
        status=ApprovalStatus.pending,
    )
    db.add(approval)
    db.commit()
    db.refresh(job)
    return _job_out(job)


@router.delete("/{job_id}", status_code=204)
def delete_job(
    job_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    job = db.query(Job).join(EmployerProfile).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(404, "Job not found")

    if user.role.value == "employer":
        profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
        if not profile or job.employer_id != profile.id:
            raise HTTPException(403, "Not your job")
    elif user.role.value != "admin":
        raise HTTPException(403, "Insufficient permissions")

    db.delete(job)
    db.commit()
    return None
