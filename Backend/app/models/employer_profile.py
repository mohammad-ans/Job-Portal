import uuid
from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class EmployerProfile(Base):
    __tablename__ = "employer_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    company_name = Column(String(200), nullable=False)
    company_website = Column(String(500), nullable=True)
    company_size = Column(String(50), nullable=True)
    industry = Column(String(120), nullable=True)
    location = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    is_approved = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User", back_populates="employer_profile")
    jobs = relationship("Job", back_populates="employer", cascade="all, delete-orphan")
