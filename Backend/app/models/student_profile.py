import uuid
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    university = Column(String(200), nullable=True)
    degree = Column(String(120), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    gpa = Column(Numeric(3, 2), nullable=True)
    skills = Column(ARRAY(Text), nullable=False, server_default="{}")
    resume_url = Column(String(500), nullable=True)
    resume_text = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    is_approved = Column(Boolean, nullable=False, default=False)
    rejection_count = Column(Integer, nullable=False, default=0, server_default="0")
    rejection_reason = Column(Text, nullable=True)
    is_closed = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User", back_populates="student_profile")
    applications = relationship(
        "Application", back_populates="student", cascade="all, delete-orphan"
    )
