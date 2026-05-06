from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.deps import get_db, require_role
from app.core.security import hash_password
from app.models.approval import Approval, ApprovalType, ApprovalStatus
from app.models.job import Job, JobStatus
from app.models.student_profile import StudentProfile
from app.models.employer_profile import EmployerProfile
from app.models.user import User, UserRole
from app.models.application import Application, ApplicationStatus
from app.models.system_log import SystemLog
from app.schemas.approval import ApprovalOut, ApprovalRejectBody, ApprovalListOut
from app.schemas.admin import AdminStatsOut, SystemLogOut, SystemLogListOut, CreateAdminRequest

router = APIRouter(prefix="/admin", tags=["admin"])
admin_only = require_role("admin")


def _approval_out(a: Approval) -> ApprovalOut:
    return ApprovalOut(
        id=a.id,
        target_type=a.target_type.value,
        target_id=a.target_id,
        name=a.name,
        details=a.details,
        ai_confidence=float(a.ai_confidence),
        flags=a.flags,
        flag_reason=a.flag_reason,
        status=a.status.value,
        created_at=a.created_at,
    )


def _log_out(log: SystemLog) -> SystemLogOut:
    return SystemLogOut(
        id=log.id,
        action=log.event,
        actor_id=log.actor_id,
        metadata=log.metadata_,
        created_at=log.created_at,
    )


def _write_log(db: Session, event: str, actor_id, metadata: dict = None):
    db.add(SystemLog(event=event, actor_id=actor_id, metadata_=metadata))


@router.get("/stats", response_model=AdminStatsOut)
def get_stats(db: Session = Depends(get_db), user=Depends(admin_only)):
    total_students = db.query(StudentProfile).filter(StudentProfile.is_approved == True).count()
    total_employers = db.query(EmployerProfile).filter(EmployerProfile.is_approved == True).count()
    active_jobs = db.query(Job).filter(Job.status == JobStatus.active).count()
    total_matches = db.query(Application).count()
    return AdminStatsOut(
        total_students=total_students,
        total_employers=total_employers,
        active_jobs=active_jobs,
        total_matches=total_matches,
    )


@router.get("/approvals", response_model=ApprovalListOut)
def list_approvals(
    status: str = Query("pending"),
    type: str = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    q = db.query(Approval)
    if status:
        try:
            q = q.filter(Approval.status == ApprovalStatus(status))
        except ValueError:
            raise HTTPException(400, f"Invalid status: {status}")
    if type:
        try:
            q = q.filter(Approval.target_type == ApprovalType(type))
        except ValueError:
            raise HTTPException(400, f"Invalid type: {type}")
    total = q.count()
    items = q.order_by(Approval.created_at.desc()).offset(offset).limit(limit).all()
    return ApprovalListOut(
        items=[_approval_out(a) for a in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("/approvals/{approval_id}/approve", response_model=ApprovalOut)
def approve(
    approval_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(404, "Approval not found")
    if approval.status != ApprovalStatus.pending:
        raise HTTPException(400, "Approval already processed")

    approval.status = ApprovalStatus.approved
    approval.reviewed_by = user.id
    approval.reviewed_at = datetime.now(timezone.utc)

    if approval.target_type == ApprovalType.company:
        profile = db.query(EmployerProfile).filter(
            EmployerProfile.id == approval.target_id
        ).first()
        if profile:
            profile.is_approved = True
            profile.user.is_verified = True

    elif approval.target_type == ApprovalType.job:
        job = db.query(Job).filter(Job.id == approval.target_id).first()
        if job:
            job.status = JobStatus.active

    elif approval.target_type == ApprovalType.student_verification:
        profile = db.query(StudentProfile).filter(
            StudentProfile.id == approval.target_id
        ).first()
        if profile:
            profile.is_approved = True
            profile.user.is_verified = True
            # Promote any pending_verification applications to applied
            db.query(Application).filter(
                Application.student_id == profile.id,
                Application.status == ApplicationStatus.pending_verification,
            ).update({"status": ApplicationStatus.applied})

    _write_log(db, f"Approved {approval.target_type.value}: {approval.name}", user.id)
    db.commit()
    db.refresh(approval)
    return _approval_out(approval)


@router.post("/approvals/{approval_id}/reject", response_model=ApprovalOut)
def reject(
    approval_id: UUID,
    body: ApprovalRejectBody = ApprovalRejectBody(),
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(404, "Approval not found")
    if approval.status != ApprovalStatus.pending:
        raise HTTPException(400, "Approval already processed")

    approval.status = ApprovalStatus.rejected
    approval.reviewed_by = user.id
    approval.reviewed_at = datetime.now(timezone.utc)
    if body.reason:
        approval.flag_reason = body.reason

    _write_log(
        db,
        f"Rejected {approval.target_type.value}: {approval.name}",
        user.id,
        {"reason": body.reason},
    )
    db.commit()
    db.refresh(approval)
    return _approval_out(approval)


@router.get("/logs", response_model=SystemLogListOut)
def get_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    logs = (
        db.query(SystemLog)
        .order_by(SystemLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return SystemLogListOut(items=[_log_out(l) for l in logs])


@router.get("/employers")
def list_employers(
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    profiles = db.query(EmployerProfile).all()
    items = []
    for p in profiles:
        job_ids = [j.id for j in p.jobs]
        app_count = (
            db.query(Application)
            .filter(Application.job_id.in_(job_ids))
            .count()
        ) if job_ids else 0
        items.append({
            "id": str(p.id),
            "company_name": p.company_name,
            "industry": p.industry,
            "is_approved": p.is_approved,
            "job_count": len(job_ids),
            "application_count": app_count,
        })
    return {"items": items}


@router.get("/employers/{employer_id}/applications")
def employer_applications(
    employer_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    profile = db.query(EmployerProfile).filter(EmployerProfile.id == employer_id).first()
    if not profile:
        raise HTTPException(404, "Employer not found")

    items = []
    for job in profile.jobs:
        for app in job.applications:
            sp = app.student
            items.append({
                "application_id": str(app.id),
                "job_title": job.title,
                "student_name": sp.user.name,
                "student_email": sp.user.email,
                "university": sp.university,
                "status": app.status.value,
                "match_score": float(app.match_score),
                "applied_at": app.created_at.isoformat(),
            })
    return {"company_name": profile.company_name, "items": items}


@router.post("/users", status_code=201)
def create_admin_user(
    body: CreateAdminRequest,
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(409, "Email already registered")
    new_user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role=UserRole.admin,
        is_verified=True,
    )
    db.add(new_user)
    _write_log(db, f"Admin user created: {body.email}", user.id)
    db.commit()
    db.refresh(new_user)
    return {"id": str(new_user.id), "name": new_user.name, "email": new_user.email, "role": "admin"}
