from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import DocumentStatus, DocumentType


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_seeker_id: int
    document_type: DocumentType
    file_url: str | None
    status: DocumentStatus
    uploaded_at: datetime | None


class DocumentStatusUpdate(BaseModel):
    status: DocumentStatus


class ParticipantOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    village: str | None
    nik: str | None
    document_status: DocumentStatus
