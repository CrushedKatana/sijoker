from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import ApplicationStatus, JobStatus, JobType


class JobCreate(BaseModel):
    title: str
    description: str
    job_type: JobType = JobType.full_time
    location: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    image_url: str | None = None


class JobUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    job_type: JobType | None = None
    location: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    image_url: str | None = None
    status: JobStatus | None = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    title: str
    description: str
    job_type: JobType
    location: str | None
    salary_min: int | None
    salary_max: int | None
    image_url: str | None
    status: JobStatus
    created_at: datetime
    company_name: str | None = None


class ApplicationCreate(BaseModel):
    job_id: int


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    job_seeker_id: int
    status: ApplicationStatus
    applied_at: datetime
    job_title: str | None = None
    company_name: str | None = None
    applicant_name: str | None = None
