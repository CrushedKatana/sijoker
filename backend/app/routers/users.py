from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.enums import Role
from app.models.user import CompanyProfile, JobSeekerProfile, User
from app.schemas.user import (
    CompanyProfileOut,
    CompanyProfileUpdate,
    JobSeekerProfileOut,
    JobSeekerProfileUpdate,
)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me/job-seeker-profile", response_model=JobSeekerProfileOut)
def get_job_seeker_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.pencari_kerja)),
):
    profile = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/me/job-seeker-profile", response_model=JobSeekerProfileOut)
def update_job_seeker_profile(
    payload: JobSeekerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.pencari_kerja)),
):
    profile = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        current_user.name = data.pop("name")
    for field, value in data.items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/me/company-profile", response_model=CompanyProfileOut)
def get_company_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.perusahaan)),
):
    profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/me/company-profile", response_model=CompanyProfileOut)
def update_company_profile(
    payload: CompanyProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.perusahaan)),
):
    profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
