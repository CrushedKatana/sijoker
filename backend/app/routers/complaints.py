import random
import string

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_optional_user, require_roles
from app.models.complaint import Complaint
from app.models.enums import ComplaintStatus, Role
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintOut, ComplaintUpdate

router = APIRouter(prefix="/api/complaints", tags=["complaints"])


def _generate_ticket_code(db: Session) -> str:
    while True:
        suffix = "".join(random.choices(string.digits, k=4))
        code = f"PGD-{suffix}"
        if not db.query(Complaint).filter(Complaint.ticket_code == code).first():
            return code


@router.post("", response_model=ComplaintOut, status_code=201)
def submit_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    complaint = Complaint(
        ticket_code=_generate_ticket_code(db),
        reporter_id=current_user.id if current_user else None,
        **payload.model_dump(),
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("", response_model=list[ComplaintOut])
def list_complaints(
    status: ComplaintStatus | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)
    return query.order_by(Complaint.created_at.desc()).all()


@router.get("/summary")
def complaint_summary(db: Session = Depends(get_db), _: User = Depends(require_roles(Role.admin, Role.operator))):
    return {
        status.value: db.query(Complaint).filter(Complaint.status == status).count() for status in ComplaintStatus
    }


@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(
    complaint_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles(Role.admin, Role.operator))
):
    complaint = db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


@router.patch("/{complaint_id}", response_model=ComplaintOut)
def update_complaint(
    complaint_id: int,
    payload: ComplaintUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    complaint = db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.status = payload.status
    db.commit()
    db.refresh(complaint)
    return complaint
