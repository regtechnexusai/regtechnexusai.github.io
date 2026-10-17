"""MUKUL Agriculture Hub plant assessment pilot API.

Safety default: inference is disabled until a reviewed model adapter is implemented.
This service never claims a disease prediction while inference is disabled.
"""
from __future__ import annotations

import io
import os
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field

MAX_IMAGE_BYTES = int(os.getenv("MUKUL_MAX_IMAGE_BYTES", str(10 * 1024 * 1024)))
ALLOWED_CROPS = {"rice", "tomato", "potato", "wheat", "maize"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    inference_enabled: bool

class AssessmentResponse(BaseModel):
    assessment_id: str
    status: Literal["possible_match", "insufficient_evidence", "unsupported_crop", "processing_error"]
    crop: str
    language: Literal["bn", "en"]
    observations: list[str] = Field(default_factory=list)
    possible_conditions: list[dict] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    expert_review_recommended: bool = True
    model_version: str | None = None
    disclaimer: str

app = FastAPI(
    title="MUKUL Plant Assessment API",
    version="0.1.0",
    description="Pilot API skeleton. Disease inference is disabled by default.",
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "MUKUL_ALLOWED_ORIGINS",
        "https://regtechnexusai.com,https://www.regtechnexusai.com",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

def inference_is_enabled() -> bool:
    return os.getenv("MUKUL_INFERENCE_ENABLED", "false").strip().lower() == "true"

def validate_image_bytes(raw: bytes, content_type: str | None) -> None:
    if not raw:
        raise HTTPException(status_code=422, detail="empty_image")
    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="image_too_large")
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail="unsupported_media_type")
    try:
        with Image.open(io.BytesIO(raw)) as image:
            if image.format not in {"JPEG", "PNG", "WEBP"}:
                raise HTTPException(status_code=415, detail="unsupported_media_format")
            image.verify()
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=422, detail="unreadable_image") from None

@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Operational check only; this does not mean disease inference is ready."""
    return HealthResponse(inference_enabled=inference_is_enabled())

@app.post("/v1/plant-assessments", response_model=AssessmentResponse)
async def create_plant_assessment(
    crop: str = Form(...),
    language: Literal["bn", "en"] = Form(...),
    consent: bool = Form(...),
    consent_policy_version: str = Form(..., min_length=1, max_length=40),
    media: UploadFile = File(...),
) -> AssessmentResponse:
    """Validate one user-consented still image; do not persist it.

    The actual model adapter is intentionally absent. The endpoint returns 503
    until a validated model, privacy review, and pilot release approval exist.
    """
    crop_key = crop.strip().lower()
    if crop_key not in ALLOWED_CROPS:
        raise HTTPException(status_code=400, detail="unsupported_crop")
    if not consent:
        raise HTTPException(status_code=400, detail="explicit_consent_required")
    if media.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail="unsupported_media_type")

    raw = await media.read(MAX_IMAGE_BYTES + 1)
    validate_image_bytes(raw, media.content_type)

    # Intentionally do not write raw image bytes to disk, logs, or a database.
    # Keep inference disabled until the model and pilot safeguards are reviewed.
    if not inference_is_enabled():
        raise HTTPException(status_code=503, detail="inference_disabled_not_yet_validated")

    # Fail closed even if an operator accidentally flips the feature flag before
    # a reviewed adapter has been implemented. Never fabricate a prediction.
    raise HTTPException(status_code=503, detail="validated_model_adapter_not_configured")
