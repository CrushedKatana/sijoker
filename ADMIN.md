# Admin branch

This branch implements the back-office panel for an employment services platform — the internal
tool staff use to manage job listings, training programs, participant documents, complaints,
news, satisfaction surveys, employer workforce reports, and platform accounts. It forks from
`main`, so it has the full shared foundation (backend API, database models, auth, design system)
available to build on.

## Scope

Everything lives under `frontend/src/app/admin/`, wrapped in a single layout
(`frontend/src/app/admin/layout.tsx`) that gates access to the `admin` and `operator` roles via
`RequireRole` and renders the shared `DashboardShell` (dark sidebar + topbar). Shared admin-only
building blocks (nav icons, a generic `Modal`, a `ConfirmDialog`, small SVG chart components, a
CSV-export helper, and document status/type label maps) live under
`frontend/src/app/admin/_components/` and `frontend/src/lib/csv.ts`; folders prefixed with `_`
are excluded from Next.js routing.

No backend code was changed. One shared frontend fix was made: `DashboardShell`'s nav
active-state logic previously highlighted a root item (e.g. the dashboard link) on every nested
route because it matched by path prefix; it now picks the single longest-matching href, which
also benefits any other branch that reuses this shell with a root + nested-route nav structure.

## Routes and backend endpoints

| Route | Purpose | Backend endpoints used |
|---|---|---|
| `/admin` | Dashboard: 4 stat cards, a 7-day visits line chart, a village distribution bar chart | `GET /api/dashboard/admin` |
| `/admin/lowongan` | Job postings: list, create, edit, delete | `GET/POST /api/jobs`, `PATCH/DELETE /api/jobs/{id}` |
| `/admin/pelaporan-perusahaan` | Employer workforce reports: filter by status, view detail, update status, CSV export | `GET /api/company-reports`, `PATCH /api/company-reports/{id}` |
| `/admin/berita` | News: create/edit form (publish or save as draft) + list with edit/delete | `GET /api/news?published_only=false`, `POST /api/news`, `PATCH/DELETE /api/news/{id}` |
| `/admin/pengaduan` | Complaints: status stat cards, table, review modal with status change | `GET /api/complaints`, `GET /api/complaints/summary`, `PATCH /api/complaints/{id}` |
| `/admin/dokumen-peserta` | Participant document list | `GET /api/documents/participants` |
| `/admin/dokumen-peserta/[id]` | Per-participant document review: verify/reject each of the 4 required documents | `GET /api/documents/participants`, `GET /api/documents/participants/{id}`, `PATCH /api/documents/{document_id}` |
| `/admin/peserta` | Participant directory with search and CSV export | `GET /api/documents/participants` |
| `/admin/pelatihan` | Training programs: create/edit form + list with edit/delete | `GET/POST /api/trainings`, `PATCH/DELETE /api/trainings/{id}` |
| `/admin/survei` | Satisfaction surveys: "Buat Survei" builder tab (dynamic questions, publish) and "Hasil Survei" tab (list of surveys linking to results) | `GET /api/surveys?published_only=false`, `POST /api/surveys` |
| `/admin/survei/[id]/hasil` | Survey results: response/score/satisfaction stats + per-question breakdown, CSV export | `GET /api/surveys/{id}`, `GET /api/surveys/{id}/results` |
| `/admin/akun` | Account management: role stat cards, search, create/edit/delete (admin-only), read-only for operator | `GET /api/accounts`, `GET /api/accounts/summary`, `POST /api/accounts`, `PATCH/DELETE /api/accounts/{id}` |

## Known limitations

- **Lowongan Pekerjaan** shows only active jobs. The backend's `GET /api/jobs` list endpoint
  always filters to `status == aktif` and there is no admin-scoped "all jobs" endpoint (the only
  other list endpoint, `/api/jobs/mine`, is restricted to the `perusahaan` role). Since the brief
  disallows backend changes on this branch, inactive jobs are not visible or manageable from the
  admin panel. This would need a small backend addition (an admin-only list endpoint, or an
  `include_inactive` query param) to fix properly.
- **Image/file uploads** use plain URL text inputs styled as dropzones (news thumbnails, training
  banners, job images) rather than real file pickers, since no generic image-upload endpoint
  exists on `main`.
- **"Export Excel" / "Export"** buttons produce a CSV download (built client-side from the
  currently visible rows) rather than a real `.xlsx` file — no spreadsheet library dependency was
  added to keep the bundle light, per the brief.
- **Pratinjau** (survey builder preview) is a lightweight read-only modal, not a full response
  simulation.

## Demo credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@example.gov` | `admin1234` | Full access, including account management |
| Operator | `rina.a@example.gov` | `operator123` | Everything except account create/edit/delete |
