from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime


class AdminStatsOut(BaseModel):
    total_students: int
    total_employers: int
    active_jobs: int
    total_matches: int


class SystemLogOut(BaseModel):
    id: UUID
    action: str
    actor_id: Optional[UUID] = None
    metadata: Optional[Any] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SystemLogListOut(BaseModel):
    items: List[SystemLogOut]


class CreateAdminRequest(BaseModel):
    name: str
    email: str
    password: str
