# Employer Portal

This branch implements the employer portal for an employment services platform — the
logged-in experience for a company/employer account. It is built entirely on top of the
shared foundation on `main` (auth, API client, design system, database/backend) and does not
touch the public marketing site, the admin/back-office panel, or the job seeker dashboard,
which are built on sibling branches.

## Scope

Everything lives under the `/perusahaan` route segment and is gated to accounts with the
`perusahaan` role via `RequireRole`. The layout is a light top-nav shell (logo + account menu
in a white header, with a tab strip underneath), distinct from the dark sidebar shell used
elsewhere in the product.

## Routes built

| Route | Purpose | Backend endpoints used |
| --- | --- | --- |
| `/perusahaan` | Dashboard: company summary card, 4 stat cards, "Tren Pelamar" bar chart, "Pelamar Terbaru" list | `GET /api/users/me/company-profile`, `GET /api/dashboard/company`, `GET /api/jobs/mine`, `GET /api/jobs/{id}/applicants` |
| `/perusahaan/laporan` | Quarterly workforce report form ("Form Pelaporan Ketenagakerjaan Perusahaan") + submission history table | `GET /api/users/me/company-profile` (prefill), `GET /api/company-reports/mine`, `POST /api/company-reports` |
| `/perusahaan/profil` | Edit company profile (name, official email, phone, sector, website, NPWP) | `GET /api/users/me/company-profile`, `PUT /api/users/me/company-profile` |
| `/perusahaan/lowongan` | List/create/edit/delete job postings, toggle active status, applicant counts per job | `GET /api/jobs/mine`, `POST /api/jobs`, `PATCH /api/jobs/{id}`, `DELETE /api/jobs/{id}`, `GET /api/jobs/{id}/applicants` (for counts) |
| `/perusahaan/lowongan/[id]` | Manage applicants for one job posting: view list, change status via dropdown | `GET /api/jobs/{id}`, `GET /api/jobs/{id}/applicants`, `PATCH /api/jobs/applications/{id}` |

## New shared pieces added on this branch

- `frontend/src/components/layout/CompanyTopNav.tsx` — the light header + tab-nav shell described above (logo, account dropdown with a link back to the profile page and logout, and the 4-tab strip: Dashboard / Buat Laporan / Lowongan / Profil Perusahaan).
- `frontend/src/app/perusahaan/layout.tsx` — wraps all routes in `RequireRole roles={["perusahaan"]}` and mounts `CompanyTopNav`.
- `frontend/src/components/ui/icons.tsx` — a small set of inline SVG icons (grid, doc-edit, building, briefcase, users, clipboard-check, check-circle, eye, plus, pencil, trash, send, chevron-down, map-pin, wallet, arrow-left) used across the dashboard, report, profile, and jobs pages. No icon library dependency was added; every existing UI primitive (`Button`, `Card`, `StatCard`, `Badge`/`StatusBadge`, `Field`/`Input`/`Select`/`Textarea`) was reused as-is.

## Deviations from the brief

- **"Simpan Draft" vs "Kirim Laporan ke Disnaker"**: the backend's `CompanyReportCreate` schema has no draft/final distinction — both buttons call `POST /api/company-reports` with `status: "pending"`. This was flagged as an acceptable simplification in the task brief since the backend doesn't model a separate draft state.
- **Report form's "Nama Perusahaan" field**: shown and editable in the form (to match the mockup's "A. Identitas Perusahaan" section) but not sent in the `POST /api/company-reports` payload, because `CompanyReportCreate` has no `company_name` field — the report's displayed company name is derived server-side from the company's profile relationship.
- **Profile edit form**: matches the `ProfilePerusahaan.png` mockup exactly (Nama Perusahaan, Email Resmi, Nomor Telepon, Sektor Usaha, Website, NPWP). City/postal code/NIB were intentionally left off this form — they aren't in the mockup, and `CompanyProfileUpdate` on the backend doesn't accept `city` or `nib` either (only `company_name`, `official_email`, `phone`, `sector`, `website`, `npwp`, `postal_code`), so the mockup and the API contract already agree on what's editable here.
- **Dashboard stat hints**: `active_jobs`/`total_applicants` hints ("N baru bulan ini" / "+N minggu ini") aren't returned by `GET /api/dashboard/company`, so they're computed client-side from the already-fetched `jobs`/`applicants` lists (jobs created this calendar month; applicants applied in the last 7 days) rather than invented or hard-coded.
- **Applicant counts on `/perusahaan/lowongan`**: fetched with one `GET /api/jobs/{id}/applicants` call per job (N+1), same pattern the dashboard uses for its "Pelamar Terbaru" list. Acceptable at seed-data scale; would want a dedicated aggregate endpoint before this scales to companies with many postings.
- **Job image field**: `image_url` is a plain text URL input (no upload endpoint for job postings exists in the backend), consistent with the `Job`/`JobCreate` schema.

## Verification

- `npx tsc --noEmit` — passes with zero errors.
- `npm run build` — production build succeeds, all `/perusahaan*` routes compile (all static except the dynamic `/perusahaan/lowongan/[id]`).
- Smoke-tested against a live backend (SQLite, seeded via `python -m app.seed`) on port 8004 with the frontend on port 3004: logged in as the demo employer, and exercised every page — dashboard load, report submission (new row appeared in the history table with "Menunggu" status), job creation (new card appeared in the list), and the applicant status dropdown on the job detail page.

## Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Employer | `hr@batudigital.example` | `password123` |

Logging in with this account (company: "PT Batu Digital Nusantara") redirects to `/perusahaan`
and lands on the dashboard described above, with seeded jobs, applicants, and one previously
submitted workforce report already in place.
