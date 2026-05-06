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
from app.schemas.user import (
    StudentProfileOut, EmployerProfileOut, UserOut, ProfilePatch, ResumeUploadOut
)
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
