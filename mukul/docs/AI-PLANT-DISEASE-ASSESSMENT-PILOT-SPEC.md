# MUKUL Agriculture Hub — AI Plant Disease Assessment
## Pilot technical specification (Bangla + English)

**Status:** Proposed specification; not production-ready  
**Target:** Pilot only  
**Website:** `https://regtechnexusai.com/mukul/`  
**Repository:** `regtechnexusai/regtechnexusai.github.io`  
**Change policy:** Additive changes only. Preserve current GitHub Pages architecture, navigation, language controls, forms, styles, and all existing behavior. Work on a separate branch and review through a pull request. Do not merge or deploy without explicit owner approval.

## 1. Purpose and boundaries

Build a bilingual pilot that helps a user submit crop images or opt into periodic frame capture from a live camera, then receive a cautious, evidence-limited assessment of possible plant-health issues.

Supported pilot crops:
- Rice (ধান)
- Tomato (টমেটো)
- Potato (আলু)
- Wheat (গম)
- Maize (ভুট্টা)

Supported interface languages: Bangla and English.

The current static-site media intake is only a capture/preview prototype. It does **not** perform visual diagnosis. This specification does not claim that a disease model or backend already exists. Disease assessment must remain disabled until an approved backend, validated model, privacy controls, and pilot evaluation are connected.

Out of scope for the pilot:
- definitive diagnosis or guarantees;
- automatic pesticide, fungicide, or fertilizer dosage recommendations;
- automated treatment or purchase decisions;
- unrestricted support for every crop, disease, geography, or language;
- background camera access or continuous recording without an active, visible user action.

## 2. User journey

1. User chooses the interface language (Bangla/English).
2. User selects one supported crop, or selects “I don't know / জানি না” and is prompted to identify the crop before model inference.
3. User reviews a concise privacy notice and explicitly consents to send media for analysis.
4. User chooses one of:
   - upload still images;
   - open camera and capture a still image;
   - opt into live-camera sampling, with a visible preview and capture indicator.
5. User may stop the camera at any time. The camera must stop when the page is left, the session is cancelled, or the browser denies access.
6. The interface shows upload/processing status and a bilingual result or a clear failure/insufficient-evidence message.
7. User can discard media and start again. The UI must not imply that media was analysed if the backend did not return a valid assessment.

## 3. Live-camera sampling rules

- Camera use starts only after an explicit click and browser permission.
- Show a persistent, visible “Camera active / ক্যামেরা চালু” indicator and a Stop button.
- Sample a single frame at a configurable interval; proposed default: **5 seconds**, with an initial cap of **12 frames per session**. These are pilot defaults to be validated with latency, bandwidth, and agronomy reviewers.
- Do not continuously upload a video stream. Extract a frame locally and submit only the sampled still frame when the user has consented.
- Never retain audio. Do not request microphone permission.
- Avoid duplicate frames where practical. Stop sampling while a request is in flight, and enforce rate/size limits server-side.
- No background or hidden capture. On camera stop, cancel future sampling and release every MediaStream track.
- A session should expire after a short configurable period of inactivity.
- If browser support is unavailable, offer still-image upload as the fallback.
- Video file uploads and 20-second local recordings may remain optional intake features, but should not be sent to the model until the pilot's video-frame policy and consent wording explicitly cover them.

## 4. Proposed architecture

### Front end
Keep GitHub Pages as the static UI. Add a small client module that:
- validates crop selection and user consent;
- performs client-side file type and size checks;
- handles explicit camera start/stop and periodic local frame capture;
- sends approved frames to the backend over HTTPS;
- renders only validated API responses;
- handles timeouts, network errors, rate limits, and unsupported media without breaking other MUKUL pages.

No secret keys, provider credentials, or privileged tokens may be placed in HTML, JavaScript, CSS, or public repository files.

### Backend
A separately hosted HTTPS API (for example, FastAPI) should sit between the public site and the inference service. It must provide:
- request validation, authentication/rate limiting appropriate to a public pilot, and abuse controls;
- file signature/MIME verification and image decoding in a resource-limited process;
- a model adapter so the model provider can be changed without rewriting the website;
- structured, schema-validated responses;
- short-lived processing and deletion controls;
- operational logging without storing raw images or unnecessary personal data;
- health/readiness checks and a kill switch that disables inference safely.

The backend host, data residency, vendor, model, cost ceiling, and retention period are **decisions required before implementation**. GitHub Pages alone cannot securely host a private model/API key or run a server-side inference service.

### Model selection
Select a model only after reviewing its licence, intended use, crop/disease label coverage, training-data provenance, known limitations, inference cost, privacy terms, and performance on Bangladesh-relevant field images. Public datasets may support prototyping but must not be treated as proof of field accuracy. Keep model name/version and evaluation dataset version recorded for each pilot release.

## 5. API contract (proposed)

### Request
`POST /v1/plant-assessments` over HTTPS, multipart form:
- `crop`: one of `rice`, `tomato`, `potato`, `wheat`, `maize`;
- `language`: `bn` or `en`;
- `media`: one still frame/image per request;
- `consent`: explicit consent flag and policy version;
- optional non-identifying context: broad region, growth stage, observed symptoms. Do not require exact GPS or personal identity.

For live sampling, each sampled frame is a separate bounded request; attach a random session identifier rather than user identity. The server must reject requests missing consent.

### Successful response
```json
{
  "assessment_id": "opaque-random-id",
  "status": "possible_match | insufficient_evidence | unsupported_crop | processing_error",
  "crop": "rice",
  "language": "bn",
  "observations": ["visible symptom described cautiously"],
  "possible_conditions": [
    {
      "label": "model-supported label",
      "confidence": 0.0,
      "evidence_note": "short, non-definitive explanation"
    }
  ],
  "alternatives": ["possible non-disease cause, if supported"],
  "next_steps": ["safe observation or information-gathering step"],
  "expert_review_recommended": true,
  "model_version": "version-id",
  "disclaimer": "preliminary guidance only"
}
```

This is a proposed schema, not a live endpoint. Confidence must be calibrated and documented; it must not be presented as a probability of truth unless calibration supports that interpretation. Do not show a disease label when the model is out of scope or evidence is insufficient. Use allow-listed labels, escaped text, schema validation, and strict response-size limits.

### Error handling
- `400`: invalid request, missing consent, or unsupported crop;
- `413`: file too large;
- `415`: unsupported or mismatched media type;
- `422`: image cannot be decoded or is unusable;
- `429`: rate limit reached;
- `503`: inference unavailable or disabled.
Return a short, bilingual user message without stack traces, secrets, internal paths, or raw provider errors.

## 6. Privacy, security, and data retention

- Show a plain-language notice before upload, in Bangla and English, identifying the processor/provider, purpose, whether data leaves the device, retention period, and how to ask for deletion.
- Require affirmative consent for each assessment session. Camera permission is separate from consent to upload frames.
- Data minimisation: no account, precise GPS, face recognition, or unrelated metadata needed for this pilot.
- Strip EXIF metadata (including GPS) before processing.
- Encrypt traffic in transit; restrict backend access; store secrets in deployment environment/secret manager.
- Default to ephemeral image processing and no persistent raw-image storage. If temporary buffering is technically required, document the exact maximum lifetime and verify deletion.
- Do not use submitted images for model training or secondary purposes unless separately and explicitly consented to.
- Apply rate limits, file size limits, content-type and file-signature checks, malware/resource-exhaustion protections, and request timeouts.
- Publish a contact and incident-response route before inviting external pilot users.
- Obtain legal/privacy review for the actual hosting jurisdiction, vendor terms, and target-user context before field testing.

## 7. Agronomic safety and user-facing wording

The system provides preliminary educational guidance, not a professional diagnosis. It must:
- distinguish visible observations from model-generated hypotheses;
- provide an “insufficient evidence — expert verification required” outcome;
- avoid inventing a disease, cause, confidence score, or treatment;
- avoid chemical product selection, pesticide/fungicide dosage, or claims of guaranteed yield recovery;
- recommend local agricultural extension services or qualified agronomists for severe, spreading, unfamiliar, or high-impact symptoms;
- advise users to follow local laws and product labels and not mix or apply chemicals based only on this assessment.

Suggested bilingual notice:

**বাংলা:** “এটি AI-সহায়তাপ্রাপ্ত প্রাথমিক মূল্যায়ন, নিশ্চিত রোগ নির্ণয় নয়। ছবির মান ও মডেলের সীমাবদ্ধতার কারণে ফল ভুল হতে পারে। কেবল এই ফলের ভিত্তিতে কীটনাশক/ছত্রাকনাশক প্রয়োগ করবেন না; প্রয়োজনে স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ নিন।”

**English:** “This is a preliminary AI-assisted assessment, not a confirmed diagnosis. Results may be wrong because of image quality and model limitations. Do not apply pesticides or fungicides based only on this result; consult a local agricultural expert when needed.”

## 8. Evaluation and pilot gates

Before external pilot use:
1. Build a documented, permissioned test set of Bangladesh-relevant field images for all five supported crops, including healthy plants, common supported conditions, lookalike symptoms, poor-quality images, mixed symptoms, and unsupported conditions.
2. Prevent data leakage between training, tuning, and evaluation sets; split by source/field where possible, not merely by near-duplicate image.
3. Have qualified crop specialists label the evaluation set and resolve disagreements.
4. Report per-crop and per-class precision, recall, confusion matrix, calibration, abstention/coverage, unsupported-input behavior, latency, failure rate, and subgroup performance by image conditions. Overall accuracy alone is insufficient.
5. Agree minimum release thresholds with agronomy reviewers before evaluating the final holdout set; record results and known failure modes. Do not invent or claim passing metrics before measurement.
6. Verify camera permission, frame interval/cap, stop behavior, network interruption, browser compatibility, mobile performance, file validation, rate limiting, and deletion.
7. Run a small supervised pilot with clear feedback/reporting channels; monitor harmful or misleading outputs and disable inference if safety issues emerge.

**Release gate:** No disease-assessment feature may be labelled “AI diagnosis live” until model validation, privacy/security review, bilingual content review, and pilot sign-off are documented.

## 9. Acceptance criteria

- Existing MUKUL homepage, knowledge pages, navigation, language selector, styling, and forms pass regression tests unchanged apart from approved additive UI.
- All five crop options and both interface languages are available.
- Camera sampling starts only after explicit permission and consent, shows its active state, follows the interval/frame cap, and reliably stops.
- No frames are transmitted before consent; no audio or hidden/background capture occurs.
- Unsupported files and server errors produce understandable bilingual messages and do not crash the page.
- The UI displays an assessment only for a valid, schema-conforming backend response.
- Missing backend, model failure, low evidence, or unsupported crop produces a clear safe fallback—not a fabricated result.
- Secrets are absent from the static repository; media is not retained by default.
- Automated checks and supervised manual tests pass; results are recorded in the PR.
- Changes remain on a separate branch and in a PR until explicit approval. No merge or deployment is performed by this specification.

## 10. Delivery sequence

1. **Specification and decisions:** approve hosting/provider, model licensing, retention, consent copy, pilot owners, and evaluation thresholds.
2. **Backend skeleton:** health endpoint, schemas, validation, rate limiting, disabled-by-default inference adapter, tests. No disease predictions yet.
3. **Model evaluation:** compare candidate models and evaluate against specialist-labelled local field images.
4. **Front-end integration:** connect the existing media intake to the backend behind an explicit pilot feature flag; preserve fallback behavior.
5. **Security and regression:** privacy/deletion tests, browser/camera tests, API contract tests, accessibility and bilingual review.
6. **Supervised pilot:** limited access, monitoring, feedback loop, and written sign-off.
7. **Release decision:** present test evidence and request explicit approval before any merge/deploy.

## 11. Open decisions before implementation

- Backend hosting/provider and data location.
- Candidate model(s), licence, and supported label taxonomy for each crop.
- Whether images may be processed by a third-party provider and under which terms.
- Retention/deletion policy and privacy contact.
- Exact sampling interval/frame cap after device/network tests.
- Agronomy reviewers, test-set ownership, and minimum per-class evaluation thresholds.
- Pilot participant group, duration, cost ceiling, and incident escalation owner.
