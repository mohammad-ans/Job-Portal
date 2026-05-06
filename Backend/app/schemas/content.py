from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID


class SuccessStoryOut(BaseModel):
    id: UUID
    name: str
    role: str
    company: str
    story_type: str
    content: str
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class SuccessStoryListOut(BaseModel):
    items: List[SuccessStoryOut]
