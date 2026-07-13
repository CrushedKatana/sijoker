from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import Role
from app.models.user import CompanyProfile, JobSeekerProfile, User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterCompany,
    RegisterJobSeeker,
    TokenResponse,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _issue_token(user: User) -> TokenResponse:
    token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, name=user.name)


@router.post("/register/job-seeker", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_job_seeker(payload: RegisterJobSeeker, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=Role.pencari_kerja,
    )
    db.add(user)
    db.flush()
    db.add(JobSeekerProfile(user_id=user.id, nik=payload.nik, phone=payload.phone))
    db.commit()
    db.refresh(user)
    return _issue_token(user)


@router.post("/register/company", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_company(payload: RegisterCompany, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=Role.perusahaan,
    )
    db.add(user)
    db.flush()
    db.add(
        CompanyProfile(
            user_id=user.id,
            company_name=payload.name,
            official_email=payload.email,
            phone=payload.phone,
            nib=payload.nib,
        )
    )
    db.commit()
    db.refresh(user)
    return _issue_token(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(or_(User.email == payload.identifier))
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user.status.value == "nonaktif":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    return _issue_token(user)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        pass
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "status": current_user.status,
    }
