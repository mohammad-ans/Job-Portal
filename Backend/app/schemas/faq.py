from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class FAQOut(BaseModel):
    id: UUID
    question: str
    answer: str
    category: str
    order_index: int
    created_at: datetime

    model_config = {"from_attributes": True}


class FAQCreate(BaseModel):
    question: str
    answer: str
    category: str = "General"
    order_index: int = 0


class FAQPatch(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    order_index: Optional[int] = None


class FAQListOut(BaseModel):
    items: List[FAQOut]
