from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.enums import EnrollmentStatus, Role
from app.models.training import Training, TrainingEnrollment
from app.models.user import User
from app.schemas.training import (
    EnrollmentOut,
    EnrollmentProgressUpdate,
    TrainingCreate,
    TrainingOut,
    TrainingUpdate,
)

router = APIRouter(prefix="/api/trainings", tags=["trainings"])


def _to_training_out(db: Session, training: Training) -> TrainingOut:
    out = TrainingOut.model_validate(training)
    out.enrolled_count = (
        db.query(TrainingEnrollment).filter(TrainingEnrollment.training_id == training.id).count()
    )
    return out


@router.get("", response_model=list[TrainingOut])
def list_trainings(q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Training)
    if q:
        query = query.filter(Training.title.ilike(f"%{q}%"))
    trainings = query.order_by(Training.created_at.desc()).all()
    return [_to_training_out(db, t) for t in trainings]


@router.get("/{training_id}", response_model=TrainingOut)
def get_training(training_id: int, db: Session = Depends(get_db)):
    training = db.get(Training, training_id)
    if not training:
        raise HTTPException(status_code=404, detail="Training not found")
    return _to_training_out(db, training)


@router.post("", response_model=TrainingOut, status_code=201)
def create_training(
    payload: TrainingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.admin, Role.operator)),
):
    training = Training(created_by=current_user.id, **payload.model_dump())
    db.add(training)
    db.commit()
    db.refresh(training)
    return _to_training_out(db, training)


@router.patch("/{training_id}", response_model=TrainingOut)
def update_training(
    training_id: int,
    payload: TrainingUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    training = db.get(Training, training_id)
    if not training:
        raise HTTPException(status_code=404, detail="Training not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(training, field, value)
    db.commit()
    db.refresh(training)
    return _to_training_out(db, training)


@router.delete("/{training_id}", status_code=204)
def delete_training(
    training_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    training = db.get(Training, training_id)
    if not training:
        raise HTTPException(status_code=404, detail="Training not found")
    db.delete(training)
    db.commit()


@router.post("/{training_id}/enroll", response_model=EnrollmentOut, status_code=201)
def enroll_training(
    training_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.pencari_kerja)),
):
    training = db.get(Training, training_id)
    if not training:
        raise HTTPException(status_code=404, detail="Training not found")
    existing = (
        db.query(TrainingEnrollment)
        .filter(TrainingEnrollment.training_id == training_id, TrainingEnrollment.job_seeker_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
    enrollment = TrainingEnrollment(training_id=training_id, job_seeker_id=current_user.id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    out = EnrollmentOut.model_validate(enrollment)
    out.training_title = training.title
    return out


@router.get("/enrollments/mine", response_model=list[EnrollmentOut])
def my_enrollments(db: Session = Depends(get_db), current_user: User = Depends(require_roles(Role.pencari_kerja))):
    enrollments = (
        db.query(TrainingEnrollment)
        .filter(TrainingEnrollment.job_seeker_id == current_user.id)
        .order_by(TrainingEnrollment.enrolled_at.desc())
        .all()
    )
    results = []
    for e in enrollments:
        out = EnrollmentOut.model_validate(e)
        training = db.get(Training, e.training_id)
        out.training_title = training.title if training else None
        results.append(out)
    return results


@router.patch("/enrollments/{enrollment_id}", response_model=EnrollmentOut)
def update_enrollment_progress(
    enrollment_id: int,
    payload: EnrollmentProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.pencari_kerja, Role.admin, Role.operator)),
):
    enrollment = db.get(TrainingEnrollment, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if current_user.role == Role.pencari_kerja and enrollment.job_seeker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your enrollment")
    enrollment.progress_percent = payload.progress_percent
    enrollment.status = payload.status or (
        EnrollmentStatus.selesai if payload.progress_percent >= 100 else EnrollmentStatus.berjalan
    )
    db.commit()
    db.refresh(enrollment)
    return enrollment
