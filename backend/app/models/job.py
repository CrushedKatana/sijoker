from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import ApplicationStatus, JobStatus, JobType


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    job_type: Mapped[JobType] = mapped_column(Enum(JobType), default=JobType.full_time)
    location: Mapped[str | None] = mapped_column(String(255))
    salary_min: Mapped[int | None] = mapped_column(Integer)
    salary_max: Mapped[int | None] = mapped_column(Integer)
    image_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.aktif)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    applications: Mapped[list["Application"]] = relationship(back_populates="job", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True)
    job_seeker_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus), default=ApplicationStatus.ditinjau)
    applied_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    job: Mapped["Job"] = relationship(back_populates="applications")
