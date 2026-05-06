from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class ContactRequestCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str


class ContactRequestOut(BaseModel):
    id: UUID
    name: str
    email: str
    subject: str
    message: str
    status: str
    user_id: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ContactRequestListOut(BaseModel):
    items: List[ContactRequestOut]
    total: int


class TicketStatusPatch(BaseModel):
    status: str
