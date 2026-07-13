from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import AccountStatus, Role


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), index=True)
    status: Mapped[AccountStatus] = mapped_column(Enum(AccountStatus), default=AccountStatus.aktif)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    job_seeker_profile: Mapped["JobSeekerProfile | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    company_profile: Mapped["CompanyProfile | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class JobSeekerProfile(Base):
    __tablename__ = "job_seeker_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    nik: Mapped[str | None] = mapped_column(String(32))
    phone: Mapped[str | None] = mapped_column(String(32))
    birth_place: Mapped[str | None] = mapped_column(String(120))
    birth_date: Mapped[str | None] = mapped_column(String(32))
    address: Mapped[str | None] = mapped_column(String(500))
    village: Mapped[str | None] = mapped_column(String(120))
    last_education: Mapped[str | None] = mapped_column(String(120))
    major: Mapped[str | None] = mapped_column(String(120))
    skills: Mapped[str | None] = mapped_column(String(500))

    user = relationship("User", back_populates="job_seeker_profile")


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    company_name: Mapped[str] = mapped_column(String(255))
    official_email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(32))
    sector: Mapped[str | None] = mapped_column(String(120))
    website: Mapped[str | None] = mapped_column(String(255))
    npwp: Mapped[str | None] = mapped_column(String(64))
    nib: Mapped[str | None] = mapped_column(String(64))
    city: Mapped[str | None] = mapped_column(String(120))
    postal_code: Mapped[str | None] = mapped_column(String(16))
    verified: Mapped[bool] = mapped_column(default=False)

    user = relationship("User", back_populates="company_profile")
