from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.success_story import SuccessStory
from app.schemas.content import SuccessStoryOut, SuccessStoryListOut

router = APIRouter(prefix="/content", tags=["content"])


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
