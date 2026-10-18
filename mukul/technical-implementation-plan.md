# MUKUL Technical Implementation Plan
**Prepared:** 18 October 2026  
**Scope:** Free-first, safety-led agricultural guidance; preserve the existing page and its current calculations/decision logic.

## 1. Current-state audit (verified in `mukul/index.html`)
- The current crop helper is a static HTML/CSS/JavaScript experience; the reviewed page has no connected backend endpoint for image inference.
- Crop guidance is generated in the browser from form answers and pre-authored symptom guidance.
- Selected photos/videos are previewed locally. The page explicitly says media is not uploaded or analysed by AI.
- Photo-quality checks are local heuristics for dimensions, brightness and sharpness. They are not crop-disease tests.
- The report already includes cautious next steps, limitations, expert photo-evidence guidance and links to agricultural references.
- The report can be printed/saved as PDF. **Implemented 18 Oct 2026:** a separate plain-text download action now exports the generated report and direct reference URLs locally in the browser.
- No paid model, API key, server, sensor, or external image-analysis service was added. This keeps this change free of model/API charges and avoids exposing credentials.

## 2. Implementation principles
1. Do not diagnose crop disease from a photo until a suitable model has been tested on independent, real field images and reviewed by qualified agricultural specialists.
2. Do not invent pesticide/fertiliser doses or present a general checklist as a treatment recommendation.
3. Keep form and report generation working if an AI/API provider is unavailable.
4. Collect the minimum necessary personal/location data; get informed consent before uploading any photo or field record.
5. Do not place provider API keys in public client-side JavaScript.
6. Keep new functionality additive; do not change existing formulas, scoring, or unrelated site architecture.

## 3. Staged delivery plan

### Phase 0 — completed today
- Add a client-side `.txt` report export beside print/PDF.
- Include report text and direct source URLs in the exported file.
- Preserve the existing media privacy statement and non-diagnostic limitations.
- No API calls or backend costs introduced.

### Phase 1 — regression and accessibility checks
- Test required fields, optional fields, every crop/region/symptom selection, Bengali/English language changes, photo/video preview, camera permission denial, oversized/unsupported media, form reset, print/PDF and text download.
- Verify exported text contains the generated report and official-source URLs, and does not claim image analysis.
- Test Android Chrome and desktop browsers; verify keyboard navigation and screen-reader status updates.
- Fix only defects found in this scoped workflow; do not alter unrelated page sections.

### Phase 2 — no-cost reliability improvements
- Keep guidance content versioned and source-reviewed, with source title, jurisdiction, publication/update date and last-checked date.
- Add a clear “last reviewed” field only when it is backed by a real review record.
- Consider offline caching only after checking the site's existing service-worker/PWA configuration to avoid duplicate workers or broken cache behavior.
- Add a simple feedback route only if a secure, consent-aware destination is available; do not pretend a local form submits data when it does not.

### Phase 3 — field-image model pilot (not production diagnosis)
- Compare a locally run ONNX model with one vision API on the same independently labelled dataset.
- Start with consented Bangladesh rice-field images across varieties, growth stages, lighting, symptom severity and look-alike causes.
- Separate training/validation/test by field, plant or collection session to reduce leakage.
- Have qualified experts label uncertain examples; retain an “unknown / cannot assess” outcome.
- Report per-class precision/recall, confusion matrix, calibration, abstention rate and results by field conditions—not only overall accuracy.
- Do not publish a disease label or treatment recommendation until an agreed acceptance threshold and expert-review protocol are met.

### Phase 4 — secure backend only if the pilot justifies it
- Use a server-side gateway for any paid or private API; keep keys out of the browser and repository.
- Apply rate limits, upload size/type validation, retention controls, consent and deletion procedures.
- Record model/provider/version, source references and uncertainty for auditability.
- Maintain the current form-based guidance as a safe fallback.
- Recheck provider pricing, free-tier limits, data use and commercial terms immediately before selection.

### Phase 5 — weather, satellite and additional crops
- Integrate only after verifying geographic coverage, licensing, resolution, freshness, costs and user value.
- Start with weather alerts from a suitable documented source; treat forecast data as contextual evidence, not proof of crop disease.
- Pilot satellite/GIS features for suitable plot sizes and cloud conditions before exposing them to smallholder farmers.
- Add further crops and languages only with locally reviewed knowledge and test data.

## 4. Cost position
- Current form/report generation, local image-quality heuristics and the new text export: no model/API usage fees.
- Hosting, domain, maintenance, human expert review and data collection may still have costs.
- ONNX inference can avoid per-image API charges, but device performance, model licence, storage and validation still need checking.
- Any third-party API must be costed from current provider terms; a free tier must not be described as unlimited or permanent.

## 5. Acceptance criteria before public AI image claims
- A documented, independently held field test set with expert references.
- Results by class and field condition, including false positives and “unknown” cases.
- Specialist approval of the user-facing wording and escalation guidance.
- Privacy/security review and a verified rollback/fallback path.
- No unsupported claim that the model is “world-class” or diagnostically accurate without evidence.

## Status
**Code change committed:** client-side text report export.  
**Not yet implemented:** AI image inference, backend, weather/satellite APIs, model training, expert-labeled field test set, or production diagnosis.  
**Live deployment:** must be checked separately; a repository commit alone does not prove that the public website has deployed or passed browser-level tests.
