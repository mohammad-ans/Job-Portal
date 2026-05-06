import uuid
import enum
from sqlalchemy import Column, String, Text, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class StoryType(str, enum.Enum):
    student = "student"
    employer = "employer"


class SuccessStory(Base):
    __tablename__ = "success_stories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    role_text = Column(String(120), nullable=False)
    company = Column(String(120), nullable=False)
    story_type = Column(Enum(StoryType, name="story_type"), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
