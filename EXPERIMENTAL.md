# Experimental branch

This branch is a sandbox for work-in-progress ideas that are not part of the stable product yet.
It forks from `main`, so it has the full shared foundation (backend API, database models, auth,
design system) available to build on.

## Purpose

Use this branch to prototype features before they are considered for one of the stable branches
(`landing-page`, `user`, `admin`, `perusahaan`). Ideas that prove out can be cherry-picked or
reimplemented cleanly on their target branch; ideas that don't can be discarded without touching
stable history.

## Current experiments

None yet. This branch currently mirrors `main` and is ready for exploratory work — for example:

- AI-assisted job matching (ranking open positions against a job seeker's profile/skills)
- SMS/WhatsApp notifications for application status changes
- A public API/webhook layer for partner integrations
- Offline-first support for the complaint form in low-connectivity areas

## Conventions

- Keep experiments isolated behind a feature flag or a distinct route segment where possible, so
  partially-finished work doesn't block others from using this branch.
- Note any new environment variables or migrations at the top of this file as experiments land.
