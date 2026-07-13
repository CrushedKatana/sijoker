import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import require_roles
from app.models.document import Document
from app.models.enums import DocumentStatus, DocumentType, Role
from app.models.user import JobSeekerProfile, User
from app.schemas.document import DocumentOut, DocumentStatusUpdate, ParticipantOut

router = APIRouter(prefix="/api/documents", tags=["documents"])

REQUIRED_DOCUMENT_TYPES = [
    DocumentType.ktp,
    DocumentType.kartu_keluarga,
    DocumentType.ijazah,
    DocumentType.kartu_ak1,
]


def _ensure_document_rows(db: Session, job_seeker_id: int) -> list[Document]:
    existing = db.query(Document).filter(Document.job_seeker_id == job_seeker_id).all()
    existing_types = {d.document_type for d in existing}
    for doc_type in REQUIRED_DOCUMENT_TYPES:
        if doc_type not in existing_types:
            doc = Document(job_seeker_id=job_seeker_id, document_type=doc_type)
            db.add(doc)
            existing.append(doc)
    db.commit()
    return db.query(Document).filter(Document.job_seeker_id == job_seeker_id).all()


@router.get("/mine", response_model=list[DocumentOut])
def my_documents(db: Session = Depends(get_db), current_user: User = Depends(require_roles(Role.pencari_kerja))):
    return _ensure_document_rows(db, current_user.id)


@router.post("/mine/{document_type}", response_model=DocumentOut)
def upload_document(
    document_type: DocumentType,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.pencari_kerja)),
):
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.upload_dir, filename)
    with open(path, "wb") as f:
        f.write(file.file.read())

    doc = (
        db.query(Document)
        .filter(Document.job_seeker_id == current_user.id, Document.document_type == document_type)
        .first()
    )
    if not doc:
        doc = Document(job_seeker_id=current_user.id, document_type=document_type)
        db.add(doc)
    doc.file_url = f"/uploads/{filename}"
    doc.status = DocumentStatus.menunggu
    doc.uploaded_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/participants", response_model=list[ParticipantOut])
def list_participants(
    q: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    query = db.query(User).filter(User.role == Role.pencari_kerja)
    if q:
        query = query.filter(User.name.ilike(f"%{q}%"))
    users = query.all()
    results = []
    for u in users:
        profile = db.query(JobSeekerProfile).filter(JobSeekerProfile.user_id == u.id).first()
        docs = db.query(Document).filter(Document.job_seeker_id == u.id).all()
        overall = DocumentStatus.terverifikasi
        if any(d.status == DocumentStatus.belum_diunggah for d in docs) or not docs:
            overall = DocumentStatus.belum_diunggah
        elif any(d.status == DocumentStatus.menunggu for d in docs):
            overall = DocumentStatus.menunggu
        elif any(d.status == DocumentStatus.ditolak for d in docs):
            overall = DocumentStatus.ditolak
        results.append(
            ParticipantOut(
                id=u.id,
                name=u.name,
                email=u.email,
                phone=profile.phone if profile else None,
                village=profile.village if profile else None,
                nik=profile.nik if profile else None,
                document_status=overall,
            )
        )
    return results


@router.get("/participants/{job_seeker_id}", response_model=list[DocumentOut])
def participant_documents(
    job_seeker_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    return _ensure_document_rows(db, job_seeker_id)


@router.patch("/{document_id}", response_model=DocumentOut)
def update_document_status(
    document_id: int,
    payload: DocumentStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.status = payload.status
    db.commit()
    db.refresh(doc)
    return doc
