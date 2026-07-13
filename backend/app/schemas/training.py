from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import EnrollmentStatus


class TrainingCreate(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    capacity: int = 0
    location: str | None = None
    scheduled_at: str | None = None
    banner_url: str | None = None


class TrainingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    capacity: int | None = None
    location: str | None = None
    scheduled_at: str | None = None
    banner_url: str | None = None


class TrainingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    category: str | None
    capacity: int
    enrolled_count: int = 0
    location: str | None
    scheduled_at: str | None
    banner_url: str | None
    created_at: datetime


class EnrollmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    training_id: int
    job_seeker_id: int
    progress_percent: int
    status: EnrollmentStatus
    enrolled_at: datetime
    training_title: str | None = None


class EnrollmentProgressUpdate(BaseModel):
    progress_percent: int
    status: EnrollmentStatus | None = None
