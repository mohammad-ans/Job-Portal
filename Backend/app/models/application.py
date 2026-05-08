import uuid
import enum
from sqlalchemy import Column, Text, DateTime, ForeignKey, Enum, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class ApplicationStatus(str, enum.Enum):
    matched = "matched"
    applied = "applied"
    pending_verification = "pending_verification"
    shortlisted = "shortlisted"
    rejected = "rejected"
    hired = "hired"


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("student_id", "job_id", name="uq_application_student_job"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
    )
    match_score = Column(Numeric(5, 2), nullable=False)
    ai_reason = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    status = Column(
        Enum(ApplicationStatus, name="application_status"),
        nullable=False,
        default=ApplicationStatus.matched,
        server_default="matched",
    )
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    student = relationship("StudentProfile", back_populates="applications")
    job = relationship("Job", back_populates="applications")
