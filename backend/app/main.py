import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import (
    accounts,
    auth,
    company_reports,
    complaints,
    dashboard,
    documents,
    jobs,
    news,
    surveys,
    trainings,
    users,
)

app = FastAPI(title="Employment Services Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(users.router)
app.include_router(jobs.router)
app.include_router(trainings.router)
app.include_router(complaints.router)
app.include_router(news.router)
app.include_router(surveys.router)
app.include_router(company_reports.router)
app.include_router(documents.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
