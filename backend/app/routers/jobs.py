from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_optional_user, require_roles
from app.models.enums import JobStatus, Role
from app.models.job import Application, Job
from app.models.user import CompanyProfile, JobSeekerProfile, User
from app.schemas.job import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationUpdate,
    JobCreate,
    JobOut,
    JobUpdate,
)

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _company_name(db: Session, company_id: int) -> str | None:
    profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == company_id).first()
    return profile.company_name if profile else None


def _to_job_out(db: Session, job: Job) -> JobOut:
    out = JobOut.model_validate(job)
    out.company_name = _company_name(db, job.company_id)
    return out


@router.get("", response_model=list[JobOut])
def list_jobs(q: str | None = None, location: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Job).filter(Job.status == JobStatus.aktif)
    if q:
        query = query.filter(Job.title.ilike(f"%{q}%"))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    jobs = query.order_by(Job.created_at.desc()).all()
    return [_to_job_out(db, j) for j in jobs]


@router.get("/mine", response_model=list[JobOut])
def list_my_jobs(db: Session = Depends(get_db), current_user: User = Depends(require_roles(Role.perusahaan))):
    jobs = db.query(Job).filter(Job.company_id == current_user.id).order_by(Job.created_at.desc()).all()
    return [_to_job_out(db, j) for j in jobs]


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _to_job_out(db, job)


@router.post("", response_model=JobOut, status_code=201)
def create_job(
    payload: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.perusahaan, Role.admin, Role.operator)),
):
    job = Job(company_id=current_user.id, **payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return _to_job_out(db, job)


@router.patch("/{job_id}", response_model=JobOut)
def update_job(
    job_id: int,
    payload: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.perusahaan, Role.admin, Role.operator)),
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.role == Role.perusahaan and job.company_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your job posting")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return _to_job_out(db, job)


@router.delete("/{job_id}", status_code=204)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.perusahaan, Role.admin, Role.operator)),
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.role == Role.perusahaan and job.company_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your job posting")
    db.delete(job)
    db.commit()


def _to_application_out(db: Session, application: Application) -> ApplicationOut:
    out = ApplicationOut.model_validate(application)
    job = db.get(Job, application.job_id)
    applicant = db.get(User, application.job_seeker_id)
    out.job_title = job.title if job else None
    out.company_name = _company_name(db, job.company_id) if job else None
    out.applicant_name = applicant.name if applicant else None
    return out


@router.post("/applications", response_model=ApplicationOut, status_code=201)
def apply_to_job(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.pencari_kerja)),
):
    job = db.get(Job, payload.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    existing = (
        db.query(Application)
        .filter(Application.job_id == payload.job_id, Application.job_seeker_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    application = Application(job_id=payload.job_id, job_seeker_id=current_user.id)
    db.add(application)
    db.commit()
    db.refresh(application)
    return _to_application_out(db, application)


@router.get("/applications/mine", response_model=list[ApplicationOut])
def my_applications(db: Session = Depends(get_db), current_user: User = Depends(require_roles(Role.pencari_kerja))):
    apps = (
        db.query(Application)
        .filter(Application.job_seeker_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    return [_to_application_out(db, a) for a in apps]


@router.get("/{job_id}/applicants", response_model=list[ApplicationOut])
def job_applicants(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.perusahaan, Role.admin, Role.operator)),
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if current_user.role == Role.perusahaan and job.company_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your job posting")
    apps = db.query(Application).filter(Application.job_id == job_id).order_by(Application.applied_at.desc()).all()
    return [_to_application_out(db, a) for a in apps]


@router.patch("/applications/{application_id}", response_model=ApplicationOut)
def update_application_status(
    application_id: int,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.perusahaan, Role.admin, Role.operator)),
):
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    job = db.get(Job, application.job_id)
    if current_user.role == Role.perusahaan and job and job.company_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your job posting")
    application.status = payload.status
    db.commit()
    db.refresh(application)
    return _to_application_out(db, application)
