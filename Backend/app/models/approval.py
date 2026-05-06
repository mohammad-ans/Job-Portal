import uuid
import enum
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class ApprovalType(str, enum.Enum):
    company = "company"
    job = "job"
    student_verification = "student_verification"


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    target_type = Column(Enum(ApprovalType, name="approval_type"), nullable=False)
    target_id = Column(UUID(as_uuid=True), nullable=False)
    name = Column(String(200), nullable=False)
    details = Column(Text, nullable=True)
    ai_confidence = Column(Numeric(5, 2), nullable=False)
    flags = Column(Integer, nullable=False, default=0)
    flag_reason = Column(Text, nullable=True)
    status = Column(
        Enum(ApprovalStatus, name="approval_status"),
        nullable=False,
        default=ApprovalStatus.pending,
        server_default="pending",
    )
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
