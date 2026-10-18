# MUKUL Technical Implementation Plan
**Prepared:** 18 October 2026  
**Scope:** Free-first, safety-led agricultural guidance; preserve existing report logic and unrelated site functionality.

## 1. Current-state audit
- The page is a static HTML/CSS/JavaScript experience; it has no secure server-side API gateway.
- Existing crop guidance is generated in the browser from form answers and pre-authored guidance.
- Photos and videos are previewed locally by default; the separate Gemini Vision test sends a selected image to Google only after explicit user consent.
- Existing local photo-quality checks estimate dimensions, brightness and sharpness. They do not establish disease or cause.
- The page retains cautious next steps, expert photo-evidence guidance, print/PDF and plain-text report export.
- **Committed experimental integration:** ONNX Runtime Web image classification, opt-in Gemini Vision API comparison, side-by-side results, one-comparison JSON export and session-only benchmark record/test-set JSON export.
- ONNX model: `nihal4/rice-disease-model`, ResNet50, four classes, Apache-2.0, approximately 98.2 MB. Its model card reports 98.47% validation accuracy; that is not independent Bangladesh field accuracy.
- Gemini Vision uses `gemini-3.8-flash`. A user-entered API key is not stored in localStorage or the repository and is cleared after the request. However, because the call originates in the browser, the key is visible to the browser runtime and this is **test-only, not production-secure**.
- **Runtime status:** JavaScript syntax and repository wiring were statically checked. A real image inference, successful API request with a valid user key, and live deployment have not yet been verified.

## 2. Safety and privacy principles
1. AI output is research-only and must not be treated as a disease diagnosis.
2. The ONNX classifier's candidate label is limited to its four training classes and can be wrong or out of scope.
3. Gemini is prompted to describe only visible observations and limitations; it must not name/confirm diseases or recommend treatments.
4. Do not generate pesticide/fertiliser doses or treatment instructions from image model output.
5. The Vision API requires a clear opt-in checkbox because the selected image leaves the device and is sent to Google. Free-tier terms may allow content use to improve Google products; users should review the provider's current terms and avoid sensitive images.
6. Do not use the browser-entered API key workflow in production. Use a secure server-side gateway with secrets management, rate limits, consent, upload validation and retention controls.
7. Keep the existing form/report fallback functional if a model, CDN or API fails.
8. Preserve existing calculations, formulas, scoring and unrelated architecture.

## 3. Implemented experimental features
- Run ONNX locally in the browser using ONNX Runtime Web; first run may download about 98.2 MB from Hugging Face.
- Run Gemini 3.8 Flash Vision after key entry and explicit consent.
- Compare both on the same first selected image. The two outputs are different types: ONNX emits a four-class candidate label; Gemini emits a non-diagnostic visual description. They are not directly equivalent predictions.
- Export a single comparison as JSON.
- Optionally mark a photo as from a Bangladesh rice field and record an expert-verified reference class. A reference label is valid ground truth only if independently confirmed by a qualified expert.
- Add comparisons to a session-only test set and export JSON containing the result metadata, optional reference label and SHA-256 photo fingerprint where Web Crypto is available. The actual image files are not included.
- The model key is never hardcoded. API requests may still fail because of invalid key, quota, browser CORS, network access or model availability; these cases need runtime testing.

## 4. Bangladesh field-image evaluation plan
1. Collect photos with permission across varieties, growth stages, districts, seasons, lighting, symptom severity, healthy plants and look-alike causes.
2. Use an independent expert to label the reference class; preserve an “other / uncertain” category.
3. Keep original images in a controlled location and link them to exported records using the SHA-256 hash; do not upload private images without consent.
4. Separate test data by field, plant or collection session to prevent leakage between training and evaluation.
5. Compare ONNX and Gemini on exactly the same images. The current JSON export records outputs but does not itself calculate diagnostic performance metrics.
6. Calculate per-class precision/recall, confusion matrix, calibration, abstention rate and performance by field condition only after expert-verified labels are available.
7. Do not present the model as reliable or use it for treatment decisions until independent validation and agricultural specialist review are complete.

## 5. Remaining implementation work
### Immediate
- Test ONNX model loading and inference in Android Chrome and desktop browsers using actual field photos.
- Test Gemini API with a user-provided, restricted test key and confirm success/error handling, quota behaviour and consent gating.
- Test image file size/type limits, no-photo state, network failure, key clearing, language switching, form reset, report print/PDF and text export.
- Verify that the current live website has deployed the repository commit.

### Before public launch
- Move Gemini requests to a secure backend; do not rely on direct-browser key entry for public production use.
- Decide whether the 98.2 MB model download is acceptable for mobile data. If not, evaluate a properly licensed quantized model or a small model trained and validated on Bangladesh field images.
- Add robust benchmark analysis and specialist review.
- Review privacy notices, image retention, user consent, API data terms and model attribution.

### Later
- Add weather data only after checking source coverage, freshness, licensing and cost.
- Pilot satellite/GIS features for suitable plot sizes and cloud conditions.
- Expand to more crops/languages only with local evidence and reviewed knowledge.

## 6. Cost position
- Local image inference avoids per-image API fees, but the model download uses data and can be heavy on low-end phones.
- Gemini usage may be free within a current eligible quota or incur charges; the free tier is limited and has different data-use terms from paid tiers.
- Hosting, maintenance, expert review and field-image collection may still cost money.
- Do not describe any third-party free tier as unlimited or permanent.

## Status
**Code committed:** local text report export; experimental ONNX inference UI; opt-in Gemini Vision test; side-by-side comparison; optional expert-reference/Bangladesh-field metadata; session-only benchmark collection and JSON export.  
**Not yet verified:** real browser inference with an actual photo, successful Gemini request with a valid key, live deployment, and model accuracy on independent Bangladesh field photos.  
**Not yet implemented:** secure server-side API gateway, validated model training/fine-tuning, performance metrics, production diagnosis, weather/satellite APIs.  
**Deployment caution:** a GitHub commit alone does not prove that the public website is live or that end-to-end browser tests pass.
