# MUKUL International Expansion — Safe Implementation Plan

**Prepared:** 20 October 2026  
**Owner:** RegTech Nexus AI  
**Scope:** Prepare the existing MUKUL website for India and selected African markets with minimum additional cost, while preserving current Bangladesh functionality.  
**Status:** Planning and baseline phase only; no production code changed.

## 1. Non-negotiable release controls
- Production `main` is read-only for this project until owner approval.
- Keep the starting snapshot at commit `b0a55e33b1cd8861aefcdb95aef76e54acc62904` and backup branch `backup/mukul-global-expansion-2026-10-20`.
- Work on `feature/mukul-international-readiness`; propose changes by pull request.
- Before touching any existing feature, document its current inputs, outputs, calculations, URL, errors and reset/export behaviour.
- Keep changes additive and isolated. Do not refactor existing crop guidance, calculations, media, AI experiment, farm records, navigation, footer or page styles unless a separately approved defect fix requires it.
- All required CI/browser/regression tests must pass. Any failure blocks merge/release; fix or revert.
- Do not merge, change GitHub Pages deployment settings, or deploy to production without explicit owner approval.

## 2. Target architecture
1. Keep the existing static GitHub Pages site and `/mukul/` URL.
2. Add an isolated country/language configuration layer, initially as version-controlled data/configuration rather than a backend rewrite.
3. Keep the Bangladesh experience as the default and preserve its current labels, fields, crop guidance and outputs.
4. Add an explicit country/region selection before showing market-specific guidance. Do not infer country from IP or browser locale for agronomic decisions.
5. Store regional crop knowledge as separate, reviewed content packs with metadata: country, region, language, crop, variety (when relevant), season, source, reviewer, review date and version.
6. Keep PWA/offline work isolated: cache only static assets and explicitly approved, versioned knowledge pages. Show when information is cached/stale. Never imply live AI, weather, or WhatsApp works offline.
7. Integrate WhatsApp only through the official WhatsApp Business Platform/provider and a secure server-side webhook when a backend is available. Never embed access tokens, secrets, or private API keys in static HTML/JavaScript.
8. Begin voice access with reviewed audio instructions and a clear route to human help. Add IVR/AI voice only after local-language accuracy, costs, escalation and privacy are tested.

## 3. Initial market strategy
- Prepare the architecture for both India and Africa concurrently.
- First India pilot candidate: West Bengal, with Bengali/English and a narrowly scoped rice knowledge pack. Add Hindi or other state/language packs only after content review.
- African pilot country is not selected yet. Compare Ghana, Kenya and Nigeria using: local agricultural partner, language fit, priority crops, availability of authoritative crop guidance, connectivity, privacy/communications obligations and support costs.
- Do not publish country-specific crop or pesticide guidance until a qualified local reviewer approves the content and source.
- Treat Africa as multiple country-specific deployments/content packs, not a single region-wide agronomy profile.

## 4. Delivery phases
### Phase 0 — baseline and safety (days 1–15)
- Record repository and page hashes, URLs, current features and deployment workflow.
- Expand the test matrix to cover current inputs, outputs, calculations, language switching, media, exports, error handling, navigation, sub-pages and mobile layouts.
- Verify the current public deployment separately from source control.
- Do not start code changes in protected feature paths until the baseline is adequate.

### Phase 1 — additive international foundation (days 16–30)
- Create versioned country/language/crop configuration data in new files.
- Define translation fallback and country selection behaviour.
- Add tests proving Bangladesh defaults and existing outputs are unchanged.
- Do not yet connect new region configuration to existing crop guidance unless tests cover both old and new flows.

### Phase 2 — low-data access (days 31–45)
- Measure page transfer size and mobile performance first.
- Optimise only identified new assets; avoid broad CSS/JavaScript refactors.
- Add a manifest/service worker only after reviewing current PWA files and cache strategy. Test install, update, offline fallback and stale-content messaging.
- No claim of offline AI or live external services.

### Phase 3 — contact channels (days 46–60)
- Design WhatsApp intake and consent flow first; obtain provider pricing and verify country coverage.
- Implement only after a secure backend/webhook, secrets storage, input validation, rate limits, retention policy and human escalation are available.
- Start voice with local reviewed audio; assess IVR/AI voice as a separately costed follow-up.

### Phase 4 — controlled pilot (days 61–90)
- Have local agronomy reviewers validate the pilot content.
- Test with a small, consented user group in the chosen India region and one selected African country.
- Track task completion, comprehension, safety, page performance, support cost and repeat usage.
- Expand only after the owner reviews test evidence and approves the release.

## 5. Regression and release matrix
| Area | Minimum checks |
|---|---|
| Protected Bangladesh path | Existing field IDs/options, inputs, outputs, safety text and source references remain unchanged |
| Calculations/results | Golden test vectors, expected values, units, rounding and invalid-input handling |
| URL/navigation | Existing URL, hash anchors, internal links, canonical URL and query/hash behaviour |
| Language | Bengali/English current behaviour; unknown/missing translation fallback; no literal `undefined` |
| Media | Photo/video selection, camera permissions, preview, delete, refresh, limits and error states |
| AI experiments | Consent gating, no secret in source, loading/error states, clear research-only limitations |
| Reports/exports | Print/PDF, text/CSV/JSON exports as applicable, correct contents and filenames |
| Responsive | 360px and representative Android/desktop widths; no horizontal overflow or clipped controls |
| PWA/offline | Install/update, cache versioning, offline fallback, stale-data labels; no false live-service claims |
| WhatsApp/voice | Consent, provider failures, duplicate messages, rate limits, data minimisation, human escalation |
| Security | Secrets absent from static source, upload validation, access controls, CSP considerations, privacy review |
| Release | CI green, diff review, rollback reference recorded, explicit owner approval |

## 6. Cost control
- Reuse current hosting, static pages, assets and existing browser tests wherever feasible.
- Prioritise configuration/content and reviewed audio before adding a new backend or automated voice.
- Do not commit to WhatsApp or voice costs until official/provider rates and projected message/call volume are checked for each country.
- Treat any budget estimate as provisional until repository complexity, translation volume, partner review and provider quotes are known.
- Track recurring costs separately from one-time development work.

## 7. Current blockers before code integration
- The current Playwright test is useful but does not yet cover every sub-page, all calculation paths, all error cases, live model inference or external services.
- The exact African pilot country, local agricultural reviewer, language and priority crop need evidence-based selection.
- WhatsApp requires an approved provider/business setup and a secure server-side integration path; static GitHub Pages alone must not hold provider secrets or receive secure webhooks.
- PWA/offline implementation must be reconciled with the existing manifest/service-worker files before changes to avoid cache conflicts.
- No new international content should be treated as validated merely because it has been translated.

## 8. Definition of done
- Every protected baseline test passes and new tests cover the changed paths.
- Bangladesh behaviour, calculations, URLs and error handling are unchanged unless explicitly approved.
- India/Africa configuration and reviewed content are isolated and traceable to source/reviewer.
- Security/privacy review passes; no secrets are shipped to browser code.
- Staging/pilot evidence is attached to the pull request.
- Any failed check blocks release.
- The owner explicitly approves merge and production deployment.
