from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.deps import get_db, get_optional_user, require_role
from app.models.contact_request import ContactRequest, TicketStatus
from app.schemas.contact import ContactRequestCreate, ContactRequestOut, ContactRequestListOut, TicketStatusPatch

router = APIRouter(prefix="/contact", tags=["contact"])
admin_only = require_role("admin")


def _out(r: ContactRequest) -> ContactRequestOut:
    return ContactRequestOut(
        id=r.id,
        name=r.name,
        email=r.email,
        subject=r.subject,
        message=r.message,
        status=r.status.value,
        user_id=r.user_id,
        created_at=r.created_at,
    )


@router.post("", response_model=ContactRequestOut, status_code=201)
def submit_contact(
    body: ContactRequestCreate,
    db: Session = Depends(get_db),
    user=Depends(get_optional_user),
):
    req = ContactRequest(
        name=body.name,
        email=body.email,
        subject=body.subject,
        message=body.message,
        user_id=user.id if user else None,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return _out(req)


@router.get("", response_model=ContactRequestListOut)
def list_contact_requests(
    status: str = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    q = db.query(ContactRequest)
    if status:
        try:
            q = q.filter(ContactRequest.status == TicketStatus(status))
        except ValueError:
            pass
    total = q.count()
    items = q.order_by(ContactRequest.created_at.desc()).offset(offset).limit(limit).all()
    return ContactRequestListOut(items=[_out(r) for r in items], total=total)


@router.patch("/{req_id}/status", response_model=ContactRequestOut)
def update_ticket_status(
    req_id: UUID,
    body: TicketStatusPatch,
    db: Session = Depends(get_db),
    user=Depends(admin_only),
):
    req = db.query(ContactRequest).filter(ContactRequest.id == req_id).first()
    if not req:
        raise HTTPException(404, "Ticket not found")
    try:
        req.status = TicketStatus(body.status)
    except ValueError:
        raise HTTPException(400, "Invalid status — must be open, in_progress, or resolved")
    db.commit()
    db.refresh(req)
    return _out(req)
