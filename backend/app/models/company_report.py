from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import ReportStatus


class CompanyReport(Base):
    __tablename__ = "company_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    period: Mapped[str] = mapped_column(String(32))
    npwp: Mapped[str | None] = mapped_column(String(64))
    nib: Mapped[str | None] = mapped_column(String(64))
    city: Mapped[str | None] = mapped_column(String(120))
    postal_code: Mapped[str | None] = mapped_column(String(16))
    sector: Mapped[str | None] = mapped_column(String(120))
    male_count: Mapped[int] = mapped_column(Integer, default=0)
    female_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[ReportStatus] = mapped_column(Enum(ReportStatus), default=ReportStatus.pending)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    @property
    def total_count(self) -> int:
        return self.male_count + self.female_count
