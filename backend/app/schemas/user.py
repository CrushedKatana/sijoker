from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import AccountStatus, Role


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: Role
    status: AccountStatus
    created_at: datetime


class AccountCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role


class AccountUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    status: AccountStatus | None = None


class JobSeekerProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nik: str | None = None
    phone: str | None = None
    birth_place: str | None = None
    birth_date: str | None = None
    address: str | None = None
    village: str | None = None
    last_education: str | None = None
    major: str | None = None
    skills: str | None = None


class JobSeekerProfileUpdate(BaseModel):
    name: str | None = None
    nik: str | None = None
    phone: str | None = None
    birth_place: str | None = None
    birth_date: str | None = None
    address: str | None = None
    village: str | None = None
    last_education: str | None = None
    major: str | None = None
    skills: str | None = None


class CompanyProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    company_name: str
    official_email: str | None = None
    phone: str | None = None
    sector: str | None = None
    website: str | None = None
    npwp: str | None = None
    nib: str | None = None
    city: str | None = None
    postal_code: str | None = None
    verified: bool


class CompanyProfileUpdate(BaseModel):
    company_name: str | None = None
    official_email: str | None = None
    phone: str | None = None
    sector: str | None = None
    website: str | None = None
    npwp: str | None = None
    postal_code: str | None = None
