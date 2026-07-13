from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import ComplaintStatus, ComplaintUrgency


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True)
    ticket_code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    reporter_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255))
    nik: Mapped[str | None] = mapped_column(String(32))
    category: Mapped[str] = mapped_column(String(120))
    urgency: Mapped[ComplaintUrgency] = mapped_column(Enum(ComplaintUrgency), default=ComplaintUrgency.sedang)
    detail: Mapped[str] = mapped_column(Text)
    evidence_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[ComplaintStatus] = mapped_column(Enum(ComplaintStatus), default=ComplaintStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
