# MUKUL international expansion configuration

This folder is an **inactive staging foundation**, not a live feature.

- `expansion-config.json` records candidate market metadata only.
- `enabled` is `false`; no existing page imports this file.
- The Ghana profile is only a pilot candidate. Local language/crop selection and partners have not been validated.
- This config must not be used to generate agricultural recommendations by itself.

## Required next implementation gates
1. Confirm a real staging preview separate from the production GitHub Pages deployment.
2. Capture reproducible input/output fixtures for every existing calculator and form before integration.
3. Have local agricultural experts approve crop-specific content, local units, seasonal assumptions, and escalation thresholds.
4. Implement country/language selection as a separate adapter; do not rewrite existing calculation or AI-analysis logic.
5. Add automated JSON validation and regression tests; execute them in CI and on the deployed staging preview.
6. Review consent, data minimization, image retention, security, and applicable local requirements.
7. Open a non-draft release PR only after all required checks pass. If any check fails, block release and revert the staging change.

## Why this is not activated
A static country list is not sufficient to safely serve farmers in a new country. Agronomy review, real localization, service fallback, and observed regression results are still missing. Keep the current MUKUL experience unchanged until those gates are satisfied.
