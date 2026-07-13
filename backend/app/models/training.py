from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import EnrollmentStatus


class Training(Base):
    __tablename__ = "trainings"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(120))
    capacity: Mapped[int] = mapped_column(Integer, default=0)
    location: Mapped[str | None] = mapped_column(String(255))
    scheduled_at: Mapped[str | None] = mapped_column(String(64))
    banner_url: Mapped[str | None] = mapped_column(String(500))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    enrollments: Mapped[list["TrainingEnrollment"]] = relationship(
        back_populates="training", cascade="all, delete-orphan"
    )


class TrainingEnrollment(Base):
    __tablename__ = "training_enrollments"

    id: Mapped[int] = mapped_column(primary_key=True)
    training_id: Mapped[int] = mapped_column(ForeignKey("trainings.id"), index=True)
    job_seeker_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    progress_percent: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[EnrollmentStatus] = mapped_column(Enum(EnrollmentStatus), default=EnrollmentStatus.belum_mulai)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    training: Mapped["Training"] = relationship(back_populates="enrollments")
