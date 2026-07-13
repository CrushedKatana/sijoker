from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.company_report import CompanyReport
from app.models.enums import ReportStatus, Role
from app.models.user import CompanyProfile, User
from app.schemas.company_report import CompanyReportCreate, CompanyReportOut, CompanyReportUpdate

router = APIRouter(prefix="/api/company-reports", tags=["company-reports"])


def _to_out(db: Session, report: CompanyReport) -> CompanyReportOut:
    out = CompanyReportOut.model_validate(report)
    out.total_count = report.total_count
    profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == report.company_id).first()
    out.company_name = profile.company_name if profile else None
    return out


@router.get("", response_model=list[CompanyReportOut])
def list_reports(
    status: ReportStatus | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    query = db.query(CompanyReport)
    if status:
        query = query.filter(CompanyReport.status == status)
    reports = query.order_by(CompanyReport.submitted_at.desc()).all()
    return [_to_out(db, r) for r in reports]


@router.get("/mine", response_model=list[CompanyReportOut])
def my_reports(db: Session = Depends(get_db), current_user: User = Depends(require_roles(Role.perusahaan))):
    reports = (
        db.query(CompanyReport)
        .filter(CompanyReport.company_id == current_user.id)
        .order_by(CompanyReport.submitted_at.desc())
        .all()
    )
    return [_to_out(db, r) for r in reports]


@router.post("", response_model=CompanyReportOut, status_code=201)
def submit_report(
    payload: CompanyReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.perusahaan)),
):
    report = CompanyReport(company_id=current_user.id, **payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return _to_out(db, report)


@router.patch("/{report_id}", response_model=CompanyReportOut)
def update_report_status(
    report_id: int,
    payload: CompanyReportUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    report = db.get(CompanyReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = payload.status
    db.commit()
    db.refresh(report)
    return _to_out(db, report)


@router.get("/{report_id}", response_model=CompanyReportOut)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.admin, Role.operator, Role.perusahaan)),
):
    report = db.get(CompanyReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if current_user.role == Role.perusahaan and report.company_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your report")
    return _to_out(db, report)
