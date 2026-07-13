# Employment Services Platform

A full-stack, role-based platform connecting job seekers, employers, and a public workforce
office. It provides job listings and applications, vocational training enrollment, a public
complaints channel, satisfaction surveys, news/announcements, employer workforce reporting, and
participant document verification.

## Stack

- **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS)
- **Backend:** FastAPI (Python), SQLAlchemy ORM, JWT authentication
- **Database:** MySQL

## Repository layout

```
backend/            FastAPI application
  app/
    core/            settings, database session, security, auth dependencies
    models/          SQLAlchemy models
    schemas/         Pydantic request/response schemas
    routers/         API route handlers, grouped by domain
    seed.py          demo data for local development
    init_db.py       creates tables from models (dev bootstrap)
  alembic/           migration scaffolding
frontend/            Next.js application
  src/
    app/             routed pages (App Router)
    components/      shared UI (components/ui) and layout shells (components/layout)
    lib/             API client, auth context, shared types, helpers
docker-compose.yml   local MySQL + backend + frontend
```

## Branching model

This repository is organized so each major area of the product lives on its own branch, built on
top of the shared foundation (auth, design system, API client, database schema) on `main`:

| Branch          | Scope                                                              |
| ---------------- | ------------------------------------------------------------------- |
| `main`            | Shared foundation: backend API, database models, auth pages, design system |
| `landing-page`     | Public marketing site: home, job board, training catalog, news, complaint form, satisfaction survey |
| `user`             | Job seeker dashboard: profile, documents, applications, training progress |
| `admin`            | Back-office panel: accounts, job postings, training, complaints, news, surveys, participant documents, employer report review |
| `perusahaan`       | Employer portal: company profile, job postings, applicant tracking, workforce reporting |
| `experimental`     | Sandbox for work-in-progress ideas, not part of the stable product |

Every feature branch can be checked out and run independently against the same backend, since
authentication and the API contract are already established on `main`.

## Getting started

### 1. Database + backend

```bash
docker compose up -d mysql
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # adjust DATABASE_URL if needed
python -m app.seed     # creates tables and demo accounts
uvicorn app.main:app --reload
```

The API is served at `http://localhost:8000` (interactive docs at `/docs`).

Demo accounts created by the seed script:

| Role            | Email                       | Password      |
| --------------- | ---------------------------- | -------------- |
| Admin            | admin@example.gov            | admin1234      |
| Operator          | rina.a@example.gov           | operator123    |
| Job seeker        | rizky.f@email.com            | password123    |
| Employer          | hr@batudigital.example       | password123    |

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

The site is served at `http://localhost:3000`.

### 3. Everything via Docker

```bash
docker compose up --build
```

## Notes

- Passwords are hashed with bcrypt; sessions use short-lived JWT bearer tokens.
- File uploads (participant documents, training banners, news thumbnails) are stored on local
  disk under `backend/uploads/` and served at `/uploads/...` in development. Swap for object
  storage before deploying.
