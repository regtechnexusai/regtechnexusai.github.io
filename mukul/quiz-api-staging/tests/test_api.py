from fastapi.testclient import TestClient
from app import main

client = TestClient(main.app)

def test_liveness_discloses_no_environment_details():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert "database" not in response.text.lower()

def test_readiness_is_generic_when_database_is_unavailable(monkeypatch):
    monkeypatch.setattr(main, "_database_ready", lambda: False)
    response = client.get("/readyz")
    assert response.status_code == 503
    assert response.json() == {"status": "not_ready"}

def test_readiness_when_database_is_available(monkeypatch):
    monkeypatch.setattr(main, "_database_ready", lambda: True)
    response = client.get("/readyz")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}

def test_admin_route_rejects_missing_token(monkeypatch):
    monkeypatch.setenv("ADMIN_API_TOKEN", "test-secret-token")
    assert client.get("/v1/admin/health").status_code == 401

def test_admin_route_rejects_wrong_token(monkeypatch):
    monkeypatch.setenv("ADMIN_API_TOKEN", "test-secret-token")
    response = client.get("/v1/admin/health", headers={"Authorization": "Bearer wrong"})
    assert response.status_code == 401

def test_admin_route_accepts_configured_token(monkeypatch):
    monkeypatch.setenv("ADMIN_API_TOKEN", "test-secret-token")
    response = client.get("/v1/admin/health", headers={"Authorization": "Bearer test-secret-token"})
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "mukul-quiz-api-staging"}

def test_admin_route_fails_closed_when_token_is_unconfigured(monkeypatch):
    monkeypatch.delenv("ADMIN_API_TOKEN", raising=False)
    assert client.get("/v1/admin/health").status_code == 503
