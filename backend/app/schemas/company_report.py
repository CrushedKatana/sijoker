from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import ReportStatus


class CompanyReportCreate(BaseModel):
    period: str
    npwp: str | None = None
    nib: str | None = None
    city: str | None = None
    postal_code: str | None = None
    sector: str | None = None
    male_count: int = 0
    female_count: int = 0
    status: ReportStatus = ReportStatus.pending


class CompanyReportUpdate(BaseModel):
    status: ReportStatus


class CompanyReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    period: str
    npwp: str | None
    nib: str | None
    city: str | None
    postal_code: str | None
    sector: str | None
    male_count: int
    female_count: int
    total_count: int
    status: ReportStatus
    submitted_at: datetime
    company_name: str | None = None
