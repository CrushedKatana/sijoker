from pydantic import BaseModel, EmailStr

from app.models.enums import Role


class RegisterJobSeeker(BaseModel):
    name: str
    email: EmailStr
    phone: str
    nik: str
    password: str


class RegisterCompany(BaseModel):
    name: str
    email: EmailStr
    phone: str
    nib: str
    password: str


class LoginRequest(BaseModel):
    identifier: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    user_id: int
    name: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
