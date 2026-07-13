from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.enums import NewsStatus, Role
from app.models.news import News
from app.models.user import User
from app.schemas.news import NewsCreate, NewsOut, NewsUpdate

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("", response_model=list[NewsOut])
def list_news(published_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(News)
    if published_only:
        query = query.filter(News.status == NewsStatus.published)
    return query.order_by(News.created_at.desc()).all()


@router.get("/{news_id}", response_model=NewsOut)
def get_news(news_id: int, db: Session = Depends(get_db)):
    item = db.get(News, news_id)
    if not item:
        raise HTTPException(status_code=404, detail="News not found")
    return item


@router.post("", response_model=NewsOut, status_code=201)
def create_news(
    payload: NewsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.admin, Role.operator)),
):
    data = payload.model_dump()
    item = News(created_by=current_user.id, **data)
    if item.status == NewsStatus.published:
        item.published_at = datetime.now(timezone.utc)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{news_id}", response_model=NewsOut)
def update_news(
    news_id: int,
    payload: NewsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.admin, Role.operator)),
):
    item = db.get(News, news_id)
    if not item:
        raise HTTPException(status_code=404, detail="News not found")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(item, field, value)
    if data.get("status") == NewsStatus.published and not item.published_at:
        item.published_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{news_id}", status_code=204)
def delete_news(
    news_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles(Role.admin, Role.operator))
):
    item = db.get(News, news_id)
    if not item:
        raise HTTPException(status_code=404, detail="News not found")
    db.delete(item)
    db.commit()
