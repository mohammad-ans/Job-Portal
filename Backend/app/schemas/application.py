from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class ApplicationCreate(BaseModel):
    job_id: UUID


class ApplicationStatusPatch(BaseModel):
    status: str


class ApplicationOut(BaseModel):
    id: UUID
    job_id: UUID
    student_id: UUID
    match_score: float
    ai_reason: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CandidateMatchOut(BaseModel):
    application_id: UUID
    student_id: UUID
    name: str
    avatar_url: Optional[str] = None
    university: Optional[str] = None
    gpa: Optional[float] = None
    skills: List[str] = []
    match_score: float
    status: str
    ai_summary: Optional[str] = None
    resume_preview: str


class JobMatchListOut(BaseModel):
    items: List


class CandidateListOut(BaseModel):
    items: List[CandidateMatchOut]
