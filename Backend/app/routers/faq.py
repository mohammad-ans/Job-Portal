from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.deps import get_db, require_role
from app.models.faq import FAQ
from app.schemas.faq import FAQOut, FAQCreate, FAQPatch, FAQListOut

router = APIRouter(prefix="/faqs", tags=["faqs"])
admin_only = require_role("admin")


def _faq_out(f: FAQ) -> FAQOut:
    return FAQOut(
        id=f.id,
        question=f.question,
        answer=f.answer,
        category=f.category,
        order_index=f.order_index,
        created_at=f.created_at,
    )


@router.get("", response_model=FAQListOut)
def list_faqs(db: Session = Depends(get_db)):
    faqs = db.query(FAQ).order_by(FAQ.category, FAQ.order_index, FAQ.created_at).all()
    return FAQListOut(items=[_faq_out(f) for f in faqs])


@router.post("", response_model=FAQOut, status_code=201)
def create_faq(body: FAQCreate, db: Session = Depends(get_db), user=Depends(admin_only)):
    faq = FAQ(
        question=body.question,
        answer=body.answer,
        category=body.category,
        order_index=body.order_index,
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return _faq_out(faq)


@router.patch("/{faq_id}", response_model=FAQOut)
def update_faq(faq_id: UUID, body: FAQPatch, db: Session = Depends(get_db), user=Depends(admin_only)):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(404, "FAQ not found")
    for field in ("question", "answer", "category", "order_index"):
        val = getattr(body, field)
        if val is not None:
            setattr(faq, field, val)
    db.commit()
    db.refresh(faq)
    return _faq_out(faq)


@router.delete("/{faq_id}", status_code=204)
def delete_faq(faq_id: UUID, db: Session = Depends(get_db), user=Depends(admin_only)):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(404, "FAQ not found")
    db.delete(faq)
    db.commit()
    return None
