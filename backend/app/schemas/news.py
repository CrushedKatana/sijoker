from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import NewsStatus


class NewsCreate(BaseModel):
    title: str
    thumbnail_url: str | None = None
    content: str
    category: str | None = None
    status: NewsStatus = NewsStatus.draft


class NewsUpdate(BaseModel):
    title: str | None = None
    thumbnail_url: str | None = None
    content: str | None = None
    category: str | None = None
    status: NewsStatus | None = None


class NewsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    thumbnail_url: str | None
    content: str
    category: str | None
    status: NewsStatus
    published_at: datetime | None
    created_at: datetime
