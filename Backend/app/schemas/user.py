from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class StudentProfileOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    email: str
    avatar_url: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa: Optional[float] = None
    skills: List[str] = []
    resume_url: Optional[str] = None
    bio: Optional[str] = None
    is_approved: bool
    rejection_count: int = 0
    rejection_reason: Optional[str] = None
    is_closed: bool = False

    model_config = {"from_attributes": True}


class EmployerProfileOut(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    email: str
    company_name: str
    company_website: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    is_approved: bool
    rejection_reason: Optional[str] = None

    model_config = {"from_attributes": True}


class ProfilePatch(BaseModel):
    name: Optional[str] = None
    # Student fields
    university: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa: Optional[float] = None
    bio: Optional[str] = None
    # Employer fields
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None  # alias accepted from frontend, mapped to company_website


class ResumeUploadOut(BaseModel):
    resume_url: str
    resume_text: str
    skills_extracted: List[str]


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


class AvatarUploadOut(BaseModel):
    avatar_url: str
