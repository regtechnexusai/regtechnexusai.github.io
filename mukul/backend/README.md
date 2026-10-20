# MUKUL Plant Assessment API — Pilot Skeleton

**Status: not production-ready. Disease inference is deliberately disabled.**

This is an additive backend scaffold for the MUKUL Agriculture Hub pilot. It does not contain a trained model, does not diagnose plant disease, and must not be advertised as an active diagnosis service. The existing public website is static GitHub Pages; this API must be deployed separately to a reviewed HTTPS host before any front-end integration.

## Supported request scope

- Crops: rice, tomato, potato, wheat, maize
- UI language code: `bn` or `en`
- One still image per request: JPEG, PNG, or WebP
- Explicit consent and a consent-policy version required
- Default maximum image size: 10 MiB (configurable with `MUKUL_MAX_IMAGE_BYTES`)
- Raw image bytes are processed in memory and are not intentionally persisted by this application

Live camera sampling is a **front-end capture strategy**, not a server-side video stream. The browser must only send an individually sampled frame after visible user action, camera permission, and explicit consent. The frontend should stop sampling when requested, on navigation, or when a request is in flight.

## Local development

Use Python 3.11 or newer in a virtual environment:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --app-dir . --host 127.0.0.1 --port 8000
```

Run tests from this directory:

```bash
pytest -q
```

Check `GET /health`. The endpoint reports whether the inference feature flag is enabled, not whether a model is validated or ready.

## API

`POST /v1/plant-assessments` accepts multipart fields `crop`, `language`, `consent`, `consent_policy_version`, and one `media` image.

At present, valid requests return HTTP 503 with `inference_disabled_not_yet_validated`. This is intentional. Even if `MUKUL_INFERENCE_ENABLED=true` is set, the route returns 503 with `validated_model_adapter_not_configured`. Do not turn on or remove these safeguards before a reviewed model adapter and release gate exist.

## Required deployment configuration

- `MUKUL_ALLOWED_ORIGINS`: comma-separated exact allowed website origins; default is the RegTech Nexus AI production origin pair
- `MUKUL_MAX_IMAGE_BYTES`: maximum image size in bytes; default 10 MiB
- `MUKUL_INFERENCE_ENABLED`: remains `false` until the documented release gate is met; enabling this flag alone does not enable inference

Do not put credentials in the repository or static site. Use the deployment platform's secret manager for any future provider credentials.

## Required before pilot release

1. Select hosting, region/data residency, vendor and budget.
2. Review model licence, provenance, crop/disease taxonomy and vendor privacy terms.
3. Build a specialist-labelled, Bangladesh-relevant evaluation set and publish per-crop/per-class metrics.
4. Add and test a model adapter with calibrated uncertainty and safe abstention.
5. Complete privacy/legal, security, deletion, rate-limit and abuse reviews.
6. Add bilingual consent/privacy UI and test that no media is sent before consent.
7. Test on supported mobile browsers, camera denial, stop behavior, network failure, malformed/oversized images and backend outages.
8. Keep inference disabled until written pilot approval. Do not merge/deploy without owner approval.

## Known limitations

- No model adapter or diagnosis exists.
- This scaffold does not implement persistent job storage, user accounts, video ingestion, or a queue.
- MIME checks are combined with image decoding, but production deployment still requires infrastructure-level request limits, timeouts, abuse protection, monitoring and security review.
- The application must be served behind HTTPS and an appropriately configured reverse proxy in any hosted environment.
