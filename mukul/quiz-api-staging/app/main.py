"""Minimal, non-production MUKUL quiz API scaffold.
No quiz-content or authoring endpoints until security review.
"""
from __future__ import annotations
import hmac
import os
import psycopg
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.responses import JSONResponse

app = FastAPI(title="MUKUL Quiz API (Staging)", version="0.1.0", docs_url=None, redoc_url=None, openapi_url=None)

def _database_ready() -> bool:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        return False
    try:
        with psycopg.connect(database_url, connect_timeout=2) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                return cursor.fetchone() == (1,)
    except Exception:
        # Do not disclose credentials, hostnames, or database errors to callers.
        return False

def _require_admin(authorization: str | None = Header(default=None)) -> None:
    expected = os.getenv("ADMIN_API_TOKEN", "")
    if not expected:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Administrative access is not configured")
    scheme, _, supplied = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not supplied or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized", headers={"WWW-Authenticate": "Bearer"})

@app.get("/healthz", include_in_schema=False)
def healthz() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/readyz", include_in_schema=False)
def readyz() -> JSONResponse:
    if not _database_ready():
        return JSONResponse(status_code=503, content={"status": "not_ready"})
    return JSONResponse(status_code=200, content={"status": "ready"})

@app.get("/v1/admin/health", dependencies=[Depends(_require_admin)], include_in_schema=False)
def admin_health() -> dict[str, str]:
    return {"status": "ok", "service": "mukul-quiz-api-staging"}
