# MUKUL Regression Baseline — 20 October 2026

## Purpose
Establish a source-controlled reference before any internationalisation or low-data upgrade. This document records the repository snapshot and current regression coverage; it is not a claim that every live-production behaviour has already been independently tested.

## Protected production baseline
- Repository: `regtechnexusai/regtechnexusai.github.io`
- Production URL: https://regtechnexusai.com/mukul/
- Base branch: `main`
- Base commit SHA: `b0a55e33b1cd8861aefcdb95aef76e54acc62904`
- MUKUL home page: `mukul/index.html`
- Home page blob SHA at baseline: `885820716fdfea02e3e8eacb1551bc23ac1b5d10`
- Home page source size reported by GitHub API: 215,268 bytes (fetched UTF-8 content: 176,366 characters)
- Backup branch: `backup/mukul-global-expansion-2026-10-20`
- Working branch: `feature/mukul-international-readiness`
- Deployment architecture: GitHub Pages workflow deploys when `main` changes. Feature branches are not to be merged or deployed without explicit owner approval.

## Existing page capabilities identified in source
- Responsive single-page MUKUL landing experience and existing navigation/section anchors.
- Language selector and current Bengali/English local-label handling, with optional third-party translation UI.
- Crop-help form with region, district, season, variety, crop age/unit, growth stage, planting date, area/unit, spread, field condition, management, leaf age, yellowing pattern and other symptoms.
- Browser-generated crop guidance/result, safety boundaries and reference links.
- Photo gallery upload, video upload, live camera, frame capture and video recording controls.
- Local media preview, refresh/delete/reset actions and local photo-quality inspection.
- Experimental ONNX Runtime Web image classification and opt-in Gemini Vision comparison UI; this is not a verified production disease diagnosis.
- Comparison/test-set JSON export controls.
- Result print/PDF and report download/export actions.
- Existing market/search/filter sections, knowledge/source sections, navigation anchors and footer.
- Separate MUKUL sub-pages and supporting assets must be inventoried before their code is changed.

## Existing regression coverage located
- Workflow: `.github/workflows/mukul-visual-regression.yml`
- Test: `tests/mukul/visual-regression.cjs`
- The workflow starts a local static server and runs Playwright/Chromium against `/mukul/`; it blocks third-party network calls during the test.
- Existing test checks: expected section order; visible crop-help form; mobile horizontal overflow and clipped content; Vision consent layout; duplicate IDs; Bengali/English label switching; media controls and gallery-picker behaviour; local image preview and refresh; local context form fields; crop-help result content and safety boundaries; submitted-context reflection; media count; print/PDF mode; delete-media behaviour; form reset; symptom-specific guidance branches.
- Existing workflow: `.github/workflows/functional-regression.yml` runs public-site functional checks.
- Deployment workflow: `.github/workflows/deploy-pages.yml` deploys from `main`; never use it as a staging deployment mechanism without a separately approved staging configuration.

## Known gaps at baseline
- Existing browser test is not yet a complete baseline for every MUKUL sub-page, every calculation/input-output path, every error state, PWA/offline behaviour, WhatsApp, or voice support.
- A source inventory and explicit test cases for each current calculation/result/export path are required before modifying that path.
- Live deployment parity with the repository snapshot must be verified separately; a Git commit alone does not prove that GitHub Pages has finished deploying it.
- Runtime tests involving a real camera, real model download/inference, or external AI API cannot be represented as passing unless they are actually executed with the required device, files, consent and credentials.

## Mandatory release gate
1. Preserve this base commit and backup branch.
2. Make changes only on the feature branch and use a staging/test environment.
3. Before modifying a protected feature, capture its existing input, output, calculation, URL and error behaviour in a reproducible test or written baseline.
4. Run the existing tests plus new tests relevant to the change.
5. If any required test fails, stop; do not merge or deploy. Fix the defect or revert the change.
6. Review the complete diff for unrelated CSS, content, calculation, navigation, URL or settings changes.
7. Merge and production deployment require explicit owner approval.
8. Retain commit SHA, test result and rollback reference for every release.

## Initial baseline status
- Repository snapshot and page blob SHA recorded: PASS.
- Backup branch created from the recorded base commit: PASS.
- Separate feature branch created from the same base commit: PASS.
- Full live-production end-to-end test of every existing feature: NOT YET CLAIMED.
- Internationalisation code changes: NOT STARTED in this baseline-only commit.
