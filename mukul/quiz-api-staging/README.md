# MUKUL Quiz API — isolated staging scaffold

**Status:** staging-only scaffold; not deployed and not connected to production pages.

## Purpose
Create a safe, separate backend starting point for eventual database-backed quizzes without changing the current GitHub Pages quiz experience. This scaffold deliberately exposes no question, answer, scoring, or authoring endpoints yet.

## Included
- FastAPI liveness and database-readiness probes.
- Constant-time comparison for an administrative bearer token; fails closed if unset.
- PostgreSQL 16 local staging service applying the existing schema to a disposable database.
- Separate PostgreSQL bootstrap and API runtime credentials. The API role is `NOSUPERUSER`, `NOCREATEDB`, `NOCREATEROLE`, and has no table privileges at this stage.
- Localhost-only published ports and environment-variable configuration.
- Automated API tests and Docker/PostgreSQL integration smoke checks in GitHub Actions.

## Run locally
1. Copy `.env.example` to `.env`.
2. Replace every placeholder with different long random values. Do not commit `.env`.
3. Start the isolated services:

   ```sh
   docker compose --env-file .env up --build --force-recreate
   ```

4. Check `http://127.0.0.1:8081/healthz` and `http://127.0.0.1:8081/readyz`.
5. Stop with `docker compose --env-file .env down`. For a full disposable reset only, use `docker compose --env-file .env down -v` (this deletes the local staging database volume).

The schema and runtime-role initialization scripts run only when the data volume is first created. To rerun them, stop the stack and remove only this disposable staging volume with `docker compose --env-file .env down -v`.

## Security review — current scaffold
- Never point this compose setup at production data.
- PostgreSQL and API host ports bind to loopback only; do not expose them to a public network.
- The bootstrap PostgreSQL superuser password and API runtime password are separate. The API uses only `mukul_api`, a non-superuser role with no create privileges and no table grants. Grant only specific table/sequence privileges when reviewed routes require them.
- Keep secrets in local environment variables or a secret manager. `.env.example` contains placeholders only.
- `/healthz` returns no environment or database details. `/readyz` returns only ready/not-ready.
- OpenAPI/docs are disabled and no public quiz routes exist. Never put an administrative token in browser JavaScript.
- CORS is not enabled because there are no browser-facing routes. Configure an explicit allowlist only after the frontend origin and deployment host are selected.
- Before public quiz endpoints: implement gateway rate limits, request/payload validation, parameterized SQL, privacy and retention rules, authoring authentication/authorization, audit logging, and tests proving answer keys never appear in public question payloads.
- Before production integration: review migrations, secrets management, TLS/network policy, backup/restore rehearsal, monitoring, incident response and rollback.

## Validation limits
GitHub Actions performs an actual Docker Compose startup against PostgreSQL 16, checks schema objects, verifies the API readiness probe, confirms the API role is not a superuser and has no table privileges, and checks admin-token behavior. This is a staging smoke test, not a production penetration test or external infrastructure review.

## Current non-regression guarantee
This folder is separate from `mukul/knowledge/quiz.html` and `mukul/knowledge/crop-quizzes.html`. No production quiz page, scoring algorithm, result/PDF behavior, header/footer, or mobile styling is changed by this scaffold.
