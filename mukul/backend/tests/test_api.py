import io

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)

def tiny_png() -> bytes:
    output = io.BytesIO()
    Image.new("RGB", (8, 8), color=(40, 120, 40)).save(output, format="PNG")
    return output.getvalue()

def test_health_reports_inference_disabled_by_default(monkeypatch):
    monkeypatch.delenv("MUKUL_INFERENCE_ENABLED", raising=False)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "inference_enabled": False}

def test_assessment_fails_closed_when_inference_disabled(monkeypatch):
    monkeypatch.delenv("MUKUL_INFERENCE_ENABLED", raising=False)
    response = client.post(
        "/v1/plant-assessments",
        data={
            "crop": "rice",
            "language": "bn",
            "consent": "true",
            "consent_policy_version": "pilot-privacy-v1",
        },
        files={"media": ("leaf.png", tiny_png(), "image/png")},
    )
    assert response.status_code == 503
    assert response.json()["detail"] == "inference_disabled_not_yet_validated"

def test_missing_consent_is_rejected():
    response = client.post(
        "/v1/plant-assessments",
        data={
            "crop": "tomato",
            "language": "en",
            "consent": "false",
            "consent_policy_version": "pilot-privacy-v1",
        },
        files={"media": ("leaf.png", tiny_png(), "image/png")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "explicit_consent_required"

def test_unsupported_crop_is_rejected():
    response = client.post(
        "/v1/plant-assessments",
        data={
            "crop": "banana",
            "language": "en",
            "consent": "true",
            "consent_policy_version": "pilot-privacy-v1",
        },
        files={"media": ("leaf.png", tiny_png(), "image/png")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "unsupported_crop"

def test_invalid_image_is_rejected():
    response = client.post(
        "/v1/plant-assessments",
        data={
            "crop": "maize",
            "language": "en",
            "consent": "true",
            "consent_policy_version": "pilot-privacy-v1",
        },
        files={"media": ("leaf.png", b"not an image", "image/png")},
    )
    assert response.status_code == 422
    assert response.json()["detail"] == "unreadable_image"
