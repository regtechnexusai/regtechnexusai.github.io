# MUKUL Quiz API — isolated staging scaffold

**Status:** staging-only scaffold; not deployed and not connected to production pages.

## Purpose
Create a safe, separate backend starting point for eventual database-backed quizzes without changing the current GitHub Pages quiz experience. This scaffold deliberately exposes no question, answer, scoring, or authoring endpoints yet.

## Included
- FastAPI application with liveness and database-readiness probes.
- Constant-time comparison for an optional administrative bearer token.
- PostgreSQL 16 local staging service that applies the existing schema to a disposable database.
- Localhost-only port bindings and environment-variable configuration.
- Small automated API tests.

## Run locally
1. Copy `.env.example` to `.env`.
2. Set a long random `ADMIN_API_TOKEN`; do not commit `.env`.
3. Start the isolated services:

   ```sh
   docker compose --env-file .env up --build
   ```

4. Check `http://127.0.0.1:8081/healthz` and `http://127.0.0.1:8081/readyz`.
5. Stop with `docker compose --env-file .env down`. For a full disposable reset only, use `docker compose --env-file .env down -v` (this deletes the local staging database volume).

The compose file mounts `../quiz-database/schema.sql` read-only into PostgreSQL's initialization directory. Initialization runs only when the data volume is first created; recreate the disposable volume to re-run it.

## Security and deployment boundaries
- Never point this compose setup at production data.
- PostgreSQL and the API ports bind to loopback only; do not expose them to a public network.
- Keep secrets in local environment variables or a secret manager. `.env.example` contains placeholders only.
- `/healthz` returns no environment or database details. `/readyz` returns only ready/not-ready.
- No public quiz routes are implemented yet. Do not put a privileged token in browser JavaScript.
- CORS is not enabled because this scaffold has no browser-facing routes. Configure an explicit allowlist only when the real frontend origin and deployment host are selected.
- Before adding public quiz endpoints, implement request rate limits at the gateway, payload validation, safe query patterns, privacy/retention decisions, authentication/authorization for authoring, audit logging, and tests proving answer keys never appear in question payloads.
- Before any production integration, run schema review, migration/backup and restore rehearsal, security review, staging browser regression and rollback verification.

## Current non-regression guarantee
This folder is separate from `mukul/knowledge/quiz.html` and `mukul/knowledge/crop-quizzes.html`. No production quiz page, scoring algorithm, result/PDF behavior, header/footer, or mobile styling is changed by this scaffold.
