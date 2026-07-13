from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import ComplaintStatus, ComplaintUrgency


class ComplaintCreate(BaseModel):
    full_name: str
    nik: str | None = None
    category: str
    urgency: ComplaintUrgency = ComplaintUrgency.sedang
    detail: str
    evidence_url: str | None = None


class ComplaintUpdate(BaseModel):
    status: ComplaintStatus


class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_code: str
    full_name: str
    nik: str | None
    category: str
    urgency: ComplaintUrgency
    detail: str
    evidence_url: str | None
    status: ComplaintStatus
    created_at: datetime
