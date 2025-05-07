STEP 9 – DX & Test Updates
9.1 Update Jest / Vitest mocks to point to new client paths.
9.2 Add unit test ensuring middleware returns 302 on missing role.
9.3 Add E2E Cypress test: sign-up consultant ⇒ redirected to /profile/consultant.

STEP 10 – Verify End-to-End
pnpm dev (or yarn) – load homepage (public route).
Sign-up new “consultant” – confirm:
‑ metadata includes role,
‑ redirected to /auth/complete-profile?role=consultant,
‑ refresh page retains session.
Call /api/edge-health (write trivial route) to ensure middleware doesn’t crash.
Visit /mentors/<any-slug> as logged-out user – page still loads (public).
Sign-in as student – try /profile/consultant -> expect home redirect.
