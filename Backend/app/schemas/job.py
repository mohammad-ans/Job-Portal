from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class JobCreate(BaseModel):
    title: str
    location: str
    job_type: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: str
    required_skills: List[str] = []

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "Junior Software Engineer",
                    "location": "Karachi, Pakistan",
                    "job_type": "full_time",
                    "salary_min": 50000,
                    "salary_max": 70000,
                    "description": "We are looking for a motivated grad...",
                    "required_skills": ["React", "Python", "SQL"],
                }
            ]
        }
    }


class JobPatch(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None


class JobOut(BaseModel):
    id: UUID
    title: str
    company: str
    location: str
    job_type: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: str
    required_skills: List[str] = []
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JobMatchOut(JobOut):
    match_score: float
    ai_reason: Optional[str] = None
    desc_snippet: str
    hired_count: int = 0


class JobListOut(BaseModel):
    items: List[JobOut]
    total: int
    limit: int
    offset: int
