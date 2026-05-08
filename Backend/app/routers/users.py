import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.employer_profile import EmployerProfile
from app.models.approval import Approval, ApprovalType, ApprovalStatus
from app.schemas.user import (
    StudentProfileOut, EmployerProfileOut, UserOut, ProfilePatch,
    ResumeUploadOut, PasswordChangeRequest, AvatarUploadOut
)
from app.core.security import hash_password, verify_password
from app.services import resume_parser, skills_vocab
from app.routers.auth import _user_out

router = APIRouter(prefix="/users", tags=["users"])

MAX_BYTES = settings.MAX_RESUME_MB * 1024 * 1024


def _student_out(profile: StudentProfile) -> StudentProfileOut:
    return StudentProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        name=profile.user.name,
        email=profile.user.email,
        avatar_url=profile.user.avatar_url,
        university=profile.university,
        degree=profile.degree,
        graduation_year=profile.graduation_year,
        gpa=float(profile.gpa) if profile.gpa is not None else None,
        skills=list(profile.skills or []),
        resume_url=profile.resume_url,
        bio=profile.bio,
        is_approved=profile.is_approved,
        rejection_count=profile.rejection_count or 0,
        rejection_reason=profile.rejection_reason,
        is_closed=profile.is_closed or False,
    )


def _employer_out(profile: EmployerProfile) -> EmployerProfileOut:
    return EmployerProfileOut(
        id=profile.id,
        user_id=profile.user_id,
        name=profile.user.name,
        email=profile.user.email,
        company_name=profile.company_name,
        company_website=profile.company_website,
        company_size=profile.company_size,
        industry=profile.industry,
        location=profile.location,
        description=profile.description,
        is_approved=profile.is_approved,
        rejection_reason=profile.rejection_reason,
    )


@router.get("/me/profile")
def get_my_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role.value == "student":
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Student profile not found")
        return _student_out(profile)
    elif user.role.value == "employer":
        profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Employer profile not found")
        return _employer_out(profile)
    return _user_out(user)


@router.patch("/me/profile")
def update_my_profile(
    body: ProfilePatch,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.name:
        user.name = body.name
    db.flush()

    if user.role.value == "student":
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if not profile:
            raise HTTPException(404, "Profile not found")
        for field in ("university", "degree", "graduation_year", "gpa", "bio"):
            val = getattr(body, field)
            if val is not None:
                setattr(profile, field, val)
        db.commit()
        db.refresh(profile)
        return _student_out(profile)

    elif user.role.value == "employer":
        profile = db.query(EmployerProfile).filter(EmployerProfile.user_id == user.id).first()
        if not profile:
            raise HTTPException(404, "Profile not found")
        for field in ("company_name", "company_website", "company_size", "industry", "location", "description"):
            val = getattr(body, field)
            if val is not None:
                setattr(profile, field, val)
        # Accept `website` as an alias for `company_website`
        if body.website is not None:
            profile.company_website = body.website
        db.commit()
        db.refresh(profile)
        return _employer_out(profile)

    db.commit()
    db.refresh(user)
    return _user_out(user)


@router.post("/me/resume", response_model=ResumeUploadOut)
def upload_resume(
    resume: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.value != "student":
        raise HTTPException(status_code=403, detail="Only students can upload resumes")

    if resume.content_type not in (
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ):
        pass  # allow by extension too

    file_bytes = resume.file.read()
    if len(file_bytes) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_RESUME_MB}MB limit")

    upload_dir = Path(settings.RESUME_UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(resume.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    file_path = upload_dir / filename
    file_path.write_bytes(file_bytes)

    text = resume_parser.extract_text(file_bytes, resume.filename)
    extracted = skills_vocab.extract_skills(text)

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Student profile not found")

    resume_url = f"/uploads/resumes/{filename}"
    profile.resume_url = resume_url
    profile.resume_text = text

    existing = set(profile.skills or [])
    merged = sorted(existing | set(extracted))
    profile.skills = merged

    db.commit()

    return ResumeUploadOut(
        resume_url=resume_url,
        resume_text=text,
        skills_extracted=extracted,
    )


@router.post("/me/password", status_code=204)
def change_password(
    body: PasswordChangeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    user.password_hash = hash_password(body.new_password)
    db.commit()
    return None


@router.post("/me/avatar", response_model=AvatarUploadOut)
def upload_avatar(
    avatar: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allowed = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if avatar.content_type not in allowed:
        raise HTTPException(400, "Avatar must be a JPEG, PNG, GIF, or WebP image")

    file_bytes = avatar.file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(413, "Avatar exceeds 5MB limit")

    avatar_dir = Path(settings.RESUME_UPLOAD_DIR).parent / "avatars"
    avatar_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(avatar.filename).suffix or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    (avatar_dir / filename).write_bytes(file_bytes)

    user.avatar_url = f"/uploads/avatars/{filename}"
    db.commit()
    return AvatarUploadOut(avatar_url=user.avatar_url)


@router.post("/me/re-verify", status_code=200)
def request_re_verification(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role.value != "student":
        raise HTTPException(403, "Only students can request re-verification")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "Student profile not found")
    if profile.is_closed:
        raise HTTPException(403, "Account is permanently closed after repeated rejections")
    if profile.is_approved:
        raise HTTPException(400, "Profile is already approved")
    if profile.rejection_count == 0:
        raise HTTPException(400, "No rejection on record — nothing to re-verify")

    # Clear rejection state and re-submit for approval
    profile.rejection_reason = None
    profile.is_approved = False

    existing = db.query(Approval).filter(
        Approval.target_type == ApprovalType.student_verification,
        Approval.target_id == profile.id,
        Approval.status == ApprovalStatus.pending,
    ).first()
    if not existing:
        db.add(Approval(
            target_type=ApprovalType.student_verification,
            target_id=profile.id,
            name=user.name,
            ai_confidence=80,
            flags=0,
            status=ApprovalStatus.pending,
        ))

    db.commit()
    return {"message": "Re-verification request submitted. An admin will review your profile."}
