from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.core.security import hash_password
from app.models.enums import Role
from app.models.user import CompanyProfile, JobSeekerProfile, User
from app.schemas.user import AccountCreate, AccountUpdate, UserOut

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.get("", response_model=list[UserOut])
def list_accounts(
    q: str | None = None,
    role: Role | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if q:
        query = query.filter(User.name.ilike(f"%{q}%") | User.email.ilike(f"%{q}%"))
    return query.order_by(User.created_at.desc()).all()


@router.post("", response_model=UserOut, status_code=201)
def create_account(
    payload: AccountCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin)),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.flush()
    if payload.role == Role.pencari_kerja:
        db.add(JobSeekerProfile(user_id=user.id))
    elif payload.role == Role.perusahaan:
        db.add(CompanyProfile(user_id=user.id, company_name=payload.name, official_email=payload.email))
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{account_id}", response_model=UserOut)
def update_account(
    account_id: int,
    payload: AccountUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin)),
):
    user = db.get(User, account_id)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{account_id}", status_code=204)
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin)),
):
    user = db.get(User, account_id)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(user)
    db.commit()


@router.get("/summary")
def account_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    counts = {role.value: db.query(User).filter(User.role == role).count() for role in Role}
    return counts
