# User branch

This branch builds the job seeker dashboard for an employment services platform: the logged-in
experience for a job seeker to track applications, training progress, and manage their profile
and required documents. It forks from `main`, so it has the full shared foundation (backend API,
database models, auth, design system) available to build on.

## Scope

Only the job seeker (`pencari_kerja`) experience. The public marketing site, admin panel, and
company portal are built on sibling branches (`landing-page`, `admin`, `perusahaan`).

## Routes

- **`/dashboard`** — Welcome banner with profile-completion progress bar, four stat cards
  (applications sent, interviews in progress, trainings joined, active documents), an application
  history list, a training progress panel, and a short list of recommended jobs.
  - `GET /api/dashboard/job-seeker` — completion percentage + the four stat counts
  - `GET /api/jobs/applications/mine` — application history rows
  - `GET /api/trainings/enrollments/mine` — enrolled trainings with progress
  - `GET /api/jobs` — public job listing, first few items shown as "recommended" (no real
    recommendation logic)

- **`/profile`** — Left column: avatar with initials, account status, profile-completion bar, and
  a document status list with per-document upload controls. Right column: an editable "Data Diri"
  form and an editable "Pendidikan & Keahlian" form (skills rendered as removable chips), saved
  together via one "Simpan Perubahan" action.
  - `GET /api/auth/me` — name, email (read-only display), account status
  - `GET /api/users/me/job-seeker-profile` / `PUT /api/users/me/job-seeker-profile` — profile
    fields and partial updates (plus optional `name`, which updates the account record)
  - `GET /api/documents/mine` — the four required document rows (`ktp`, `kartu_keluarga`,
    `ijazah`, `kartu_ak1`) and their verification status
  - `POST /api/documents/mine/{document_type}` — multipart upload per document type, triggered by
    a small upload icon on each row (and a bottom "Unggah Dokumen" button that opens the file
    picker for the first missing document)

Both routes are wrapped by `frontend/src/app/(user)/layout.tsx`, which gates access with
`RequireRole roles={["pencari_kerja"]}` and renders a local light top-nav
(`frontend/src/components/layout/UserTopNav.tsx`) — logo + user menu in a plain white header, with
a "Dashboard | Profil Saya" tab strip underneath — rather than the dark sidebar `DashboardShell`
used elsewhere.

## New files

- `frontend/src/app/(user)/layout.tsx`
- `frontend/src/app/(user)/dashboard/page.tsx`
- `frontend/src/app/(user)/profile/page.tsx`
- `frontend/src/components/layout/UserTopNav.tsx`
- `frontend/src/components/ui/icons.tsx` (small inline icon set used across both pages; no icon
  library is installed in this repo)

## Testing

Demo login for the seeded job seeker account (has realistic data: applications, a training
enrollment, and a mix of verified/pending/missing documents):

- Email: `rizky.f@email.com`
- Password: `password123`

## Verification performed

- `npx tsc --noEmit` — passes with zero errors
- `npm run build` — passes with zero errors, `/dashboard` and `/profile` both statically
  generated
- `npx eslint` on the new files — clean
- Smoke-tested against a live backend (SQLite, seeded data, isolated port): confirmed
  `/api/auth/login`, `/api/dashboard/job-seeker`, `/api/auth/me`,
  `/api/users/me/job-seeker-profile` (GET/PUT), `/api/jobs/applications/mine`,
  `/api/trainings/enrollments/mine`, `/api/documents/mine`, and
  `/api/documents/mine/{document_type}` (upload) all return the shapes the frontend code expects,
  and that a profile update and a document upload round-trip correctly.
