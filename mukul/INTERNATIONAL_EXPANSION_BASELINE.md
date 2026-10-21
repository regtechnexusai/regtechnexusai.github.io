# MUKUL international expansion — staging baseline

Date: 2026-10-21
Target: `mukul/` on GitHub Pages
Working branch: `mukul-expansion-staging`

## Safety and release rules
- Production/default branch must not be edited directly.
- This branch starts from the existing repository state and is the isolated work area.
- Before implementation, preserve the current application files and record their blob SHAs.
- Do not modify existing calculators, diagnosis/help flows, image-analysis behavior, routes, or current language behavior as part of the expansion configuration.
- Do not publish market guidance until local agronomists have reviewed it and country/privacy requirements have been checked.
- No production release until the existing feature baseline and the new-market checks below pass.

## Baseline snapshot
- `mukul/index.html` baseline blob SHA recorded before the optional-field fix: `885820716fdfea02e3e8eacb1551bc23ac1b5d10`.
- `mukul/shared-shell.css` baseline blob SHA observed: `72569feb502a8d71b6c047afdad924b973d61c85`.
- The homepage contains existing crop-help and AI image-analysis UI. These are protected from the international expansion configuration.
- Static regression workflow passed on commit `dd688ef893cbfd9eb530f8b7ec177d8c7b52f4cf`: [Run #216](https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/39534352410).
- Browser regression workflow passed on the same commit, including bilingual UI checks and screenshot upload: [Run #139](https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/39534352570).
- These CI results cover the automated checks implemented in the repository; they do **not** establish that every release checklist item below has passed.
- Latest browser regression passed on commit `01b3ac4e4acb0daef4e38d64ef48f05bda12d749`: [MUKUL Browser Regression Run #146](https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/39535607539). This run includes a keyboard smoke test that tabs to the homepage skip link and verifies a visible focus indicator. It does not constitute a full accessibility audit.
- Added staging-only static guardrails in `.github/scripts/regression_check.py` (commit `a51c2521fc10ed0750ddf7dd85629e8b73432586`) to parse the candidate JSON when present, require `enabled: false`, enforce review/safety flags, keep all markets in candidate/unreviewed state, and flag homepage imports of the inactive config. These checks do not alter calculator or crop-help logic. Fresh CI passed on commit `278b047bed45c484d261502ab3c0c359b278a762`: [Static Regression Run #221](https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/39534929821) and [MUKUL Browser Regression Run #144](https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/39534929822).
- Latest verification on commit `43978e1254e1e5c747997a12ed3d02ff84381963`: [MUKUL Browser Regression Run #150](https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/39536921543) and [Static Regression Run #227](https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/39536921525) both passed. The browser run includes a Farm Records input/output smoke fixture; it does not prove every calculator across the full repository is unchanged.
- No verified staging deployment URL or isolated preview environment has been confirmed. Git branch isolation is not proof of a deployed staging site.

## Regression checklist — required before release
- [ ] Homepage and all existing MUKUL routes load; internal links and footer links resolve.
- [ ] Crop-help form: required fields, submit, validation, and error states.
- [ ] AI image-analysis: consent checkbox, upload constraints, request/error states, and results.
- [x] Automated bilingual UI checks in CI passed (Browser Regression Run #144); full translation coverage still requires review.
- [x] Automated narrow-mobile and desktop horizontal-overflow checks in CI passed for the tested pages (Browser Regression Run #144); broader tablet/accessibility review remains open.
- [ ] Existing calculations and input/output pairs unchanged, verified with dedicated baseline fixtures across every applicable feature.
- [x] Farm Records smoke fixture verifies saved district/crop/soil-pH values round-trip unchanged and the current `2/6` completeness output for district + crop only (Browser Regression Run #150). This is a narrow regression fixture, not a complete calculator baseline.
- [x] Homepage skip-link is reachable by keyboard and shows a visible focus indicator (Browser Regression Run #146). Full keyboard navigation, form-label coverage, and contrast review remain open.
- [ ] Network/API failures handled without exposing secrets or user data.
- [ ] New country configuration parses and unsupported countries/languages fail safely.
- [ ] Country-specific content is reviewed by local agricultural experts.
- [ ] Privacy notice, consent, data retention/deletion, and applicable local legal requirements reviewed.
- [ ] Backup/restore and rollback procedure tested.
- [ ] All blocking checks pass before opening a production release PR.

## Implementation status
The international configuration remains an inactive proposal: `enabled: false`. It is not imported by existing pages and does not enable new market advice. The optional photo-part field no longer has native `required` validation while inside the optional experimental section, so it does not block the main crop-help form when that optional tool is unused.

**Release status: BLOCKED / NOT READY.** CI is green for the implemented static and browser tests, but required domain, privacy, calculator-fixture, accessibility, and staging-preview gates remain open. Do not mark the PR ready or merge it until those gates are addressed and verified.
