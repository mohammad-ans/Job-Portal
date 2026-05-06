from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class ApprovalOut(BaseModel):
    id: UUID
    target_type: str
    target_id: UUID
    name: str
    details: Optional[str] = None
    ai_confidence: float
    flags: int
    flag_reason: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ApprovalRejectBody(BaseModel):
    reason: Optional[str] = None


class ApprovalListOut(BaseModel):
    items: List[ApprovalOut]
    total: int
    limit: int
    offset: int
