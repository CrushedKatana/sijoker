# Landing Page Branch

This branch builds the public marketing site for the employment services platform — the
unauthenticated, publicly reachable pages that job seekers, employers, and the general public see
before signing in. It sits on top of the shared foundation on `main` (design system, API client,
auth context, backend) and does not touch auth internals, the role-specific dashboard apps, or the
backend.

## Scope

- Home / landing page with a hero section, a service overview grid, and a closing call-to-action.
- Public job board with search/filter and an apply flow gated behind job-seeker login.
- Public training catalog with search and an enroll flow gated behind job-seeker login.
- Public complaint intake form (works anonymously or while logged in).
- Public satisfaction survey (rating, multiple-choice, and short-answer questions; works
  anonymously or while logged in).
- Public news/announcements list and article detail pages.
- A navbar entry that links out to an external national job-placement portal behind a
  confirmation modal.

Everything outside this list (job-seeker dashboard, admin back office, employer portal, and the
backend itself) is out of scope for this branch and lives on its own sibling branch.

## Routes and the backend endpoints they use

| Route | Purpose | Backend endpoints |
| --- | --- | --- |
| `/` | Hero, search bar, service grid, CTA banner | none (links to other routes) |
| `/loker` | Job board: search by title/location | `GET /api/jobs` |
| `/loker/[id]` | Job detail + apply | `GET /api/jobs/{id}`, `POST /api/jobs/applications` |
| `/pelatihan` | Training catalog: search + client-side category filter | `GET /api/trainings` |
| `/pelatihan/[id]` | Training detail + enroll | `GET /api/trainings/{id}`, `POST /api/trainings/{id}/enroll` |
| `/pengaduan` | Public complaint form | `POST /api/complaints` |
| `/survei` | Satisfaction survey (renders the first published survey) | `GET /api/surveys`, `POST /api/surveys/{id}/responses` |
| `/berita` | News list (featured card + grid + client-side pagination, 9/page) | `GET /api/news` |
| `/berita/[id]` | News article detail | `GET /api/news/{id}` |

Applying to a job and enrolling in a training both require a `pencari_kerja` (job seeker) session;
if the visitor is signed out or signed in under a different role, the UI redirects to `/login`
instead of calling the endpoint. Submitting a complaint or a survey response works whether or not
the visitor is signed in, matching the backend's optional-auth behavior on those endpoints.

## Notable implementation details

- All data fetching is client-side (`"use client"` pages using `useEffect` + the shared `api`
  client from `frontend/src/lib/api.ts`), since every page needs interactive search, filters, or
  role-aware actions.
- `frontend/src/components/ui/SafeImage.tsx` renders an icon placeholder whenever an
  `image_url`/`banner_url`/`thumbnail_url` is missing or fails to load, since seed/demo data can
  reference files that were never uploaded to a given environment.
- `frontend/src/components/layout/SiapKerjaLink.tsx` is a shared trigger + confirmation-modal
  component used both by the navbar's "Siap Kerja" entry and by the matching service card on the
  home page, so the external-link confirmation only has one implementation.
- Training `scheduled_at` is a free-text display string from the backend (not an ISO date), so it
  is rendered as-is rather than reformatted.
- `frontend/src/lib/utils.ts` gained a few presentation helpers used across these pages:
  `formatJobType`, `timeAgo`, and `salaryRange`.

## Verification

- `cd frontend && npx tsc --noEmit` — passes with zero errors.
- `cd frontend && npm run build` — passes with zero errors.
- Manually smoke-tested against a local backend (SQLite, seeded via `python -m app.seed`): job
  board search, job apply (including the "already applied" error path), training enroll (including
  the "already enrolled" error path), complaint submission (ticket code display), survey
  submission, news pagination, and the Siap Kerja confirmation modal all verified working through a
  headless browser session.
