from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import DocumentStatus, DocumentType


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_seeker_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    document_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType))
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[DocumentStatus] = mapped_column(Enum(DocumentStatus), default=DocumentStatus.belum_diunggah)
    uploaded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
