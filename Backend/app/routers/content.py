from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.success_story import SuccessStory
from app.models.student_profile import StudentProfile
from app.models.employer_profile import EmployerProfile
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.schemas.content import SuccessStoryOut, SuccessStoryListOut, PublicStatsOut

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/stats", response_model=PublicStatsOut)
def get_public_stats(db: Session = Depends(get_db)):
    verified_students = db.query(StudentProfile).filter(StudentProfile.is_approved == True).count()
    verified_employers = db.query(EmployerProfile).filter(EmployerProfile.is_approved == True).count()
    active_jobs = db.query(Job).filter(Job.status == JobStatus.active).count()
    total_hires = db.query(Application).filter(Application.status == ApplicationStatus.hired).count()
    return PublicStatsOut(
        verified_students=verified_students,
        verified_employers=verified_employers,
        active_jobs=active_jobs,
        total_hires=total_hires,
    )


@router.get("/success-stories", response_model=SuccessStoryListOut)
def list_success_stories(db: Session = Depends(get_db)):
    stories = db.query(SuccessStory).order_by(SuccessStory.created_at).all()
    return SuccessStoryListOut(
        items=[
            SuccessStoryOut(
                id=s.id,
                name=s.name,
                role=s.role_text,
                company=s.company,
                story_type=s.story_type.value,
                content=s.content,
                avatar_url=s.image_url,
            )
            for s in stories
        ]
    )
