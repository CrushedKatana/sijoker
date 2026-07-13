from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.company_report import CompanyReport
from app.models.complaint import Complaint
from app.models.document import Document
from app.models.enums import ComplaintStatus, DocumentStatus, EnrollmentStatus, Role
from app.models.job import Application, Job
from app.models.training import Training, TrainingEnrollment
from app.models.user import JobSeekerProfile, User
from app.schemas.dashboard import (
    AdminDashboardOut,
    CompanyDashboardOut,
    DailyPoint,
    DistributionPoint,
    JobSeekerDashboardOut,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/admin", response_model=AdminDashboardOut)
def admin_dashboard(db: Session = Depends(get_db), _: User = Depends(require_roles(Role.admin, Role.operator))):
    total_participants = db.query(User).filter(User.role == Role.pencari_kerja).count()
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    participants_this_month = (
        db.query(User).filter(User.role == Role.pencari_kerja, User.created_at >= month_start).count()
    )
    total_trainings = db.query(Training).count()
    ongoing_trainings = (
        db.query(TrainingEnrollment.training_id)
        .filter(TrainingEnrollment.status == EnrollmentStatus.berjalan)
        .distinct()
        .count()
    )
    village_row = (
        db.query(JobSeekerProfile.village, func.count(JobSeekerProfile.id).label("cnt"))
        .filter(JobSeekerProfile.village.isnot(None))
        .group_by(JobSeekerProfile.village)
        .order_by(func.count(JobSeekerProfile.id).desc())
        .first()
    )
    top_village = village_row[0] if village_row else None

    total_complaints = db.query(Complaint).count()
    pending_complaints = db.query(Complaint).filter(Complaint.status == ComplaintStatus.pending).count()

    today = datetime.now(timezone.utc).date()
    daily_visits = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = db.query(User).filter(func.date(User.created_at) == day).count()
        daily_visits.append(DailyPoint(label=day.strftime("%a"), value=count))

    village_rows = (
        db.query(JobSeekerProfile.village, func.count(JobSeekerProfile.id))
        .filter(JobSeekerProfile.village.isnot(None))
        .group_by(JobSeekerProfile.village)
        .order_by(func.count(JobSeekerProfile.id).desc())
        .limit(5)
        .all()
    )
    participant_distribution = [DistributionPoint(label=v, value=c) for v, c in village_rows]

    return AdminDashboardOut(
        total_participants=total_participants,
        participants_this_month=participants_this_month,
        total_trainings=total_trainings,
        ongoing_trainings=ongoing_trainings,
        top_village=top_village,
        total_complaints=total_complaints,
        pending_complaints=pending_complaints,
        daily_visits=daily_visits,
        participant_distribution=participant_distribution,
    )


@router.get("/job-seeker", response_model=JobSeekerDashboardOut)
def job_seeker_dashboard(
    db: Session = Depends(get_db), current_user: User = Depends(require_roles(Role.pencari_kerja))
):
    profile = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == current_user.id).first()
    fields = ["nik", "phone", "birth_place", "birth_date", "address", "last_education", "major", "skills"]
    filled = sum(1 for f in fields if profile and getattr(profile, f)) if profile else 0
    completion = int((filled / len(fields)) * 100) if fields else 0

    applications_sent = db.query(Application).filter(Application.job_seeker_id == current_user.id).count()
    interviews = (
        db.query(Application)
        .filter(Application.job_seeker_id == current_user.id, Application.status == "interview")
        .count()
    )
    trainings_joined = (
        db.query(TrainingEnrollment).filter(TrainingEnrollment.job_seeker_id == current_user.id).count()
    )
    active_documents = (
        db.query(Document)
        .filter(Document.job_seeker_id == current_user.id, Document.status == DocumentStatus.terverifikasi)
        .count()
    )

    return JobSeekerDashboardOut(
        profile_completion=completion,
        applications_sent=applications_sent,
        interviews_in_progress=interviews,
        trainings_joined=trainings_joined,
        active_documents=active_documents,
    )


@router.get("/company", response_model=CompanyDashboardOut)
def company_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_roles(Role.perusahaan))):
    active_jobs = db.query(Job).filter(Job.company_id == current_user.id, Job.status == "aktif").count()
    job_ids = [j.id for j in db.query(Job.id).filter(Job.company_id == current_user.id).all()]
    total_applicants = db.query(Application).filter(Application.job_id.in_(job_ids)).count() if job_ids else 0
    last_report = (
        db.query(CompanyReport)
        .filter(CompanyReport.company_id == current_user.id)
        .order_by(CompanyReport.submitted_at.desc())
        .first()
    )

    today = datetime.now(timezone.utc).date()
    trend = []
    for i in range(5, -1, -1):
        month_date = today.replace(day=1) - timedelta(days=30 * i)
        count = (
            db.query(Application)
            .filter(
                Application.job_id.in_(job_ids) if job_ids else False,
                func.extract("month", Application.applied_at) == month_date.month,
                func.extract("year", Application.applied_at) == month_date.year,
            )
            .count()
            if job_ids
            else 0
        )
        trend.append(DailyPoint(label=month_date.strftime("%b"), value=count))

    return CompanyDashboardOut(
        active_jobs=active_jobs,
        total_applicants=total_applicants,
        last_report_period=last_report.period if last_report else None,
        account_status=current_user.status.value,
        applicant_trend=trend,
    )
