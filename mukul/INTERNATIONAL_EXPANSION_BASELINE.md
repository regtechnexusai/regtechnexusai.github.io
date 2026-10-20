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

## Baseline snapshot (read-only inspection)
- `mukul/index.html` exists on the staging branch; blob SHA observed: `885820716fdfea02e3e8eacb1551bc23ac1b5d10`.
- `mukul/shared-shell.css` exists on the staging branch; blob SHA observed: `72569feb502a8d71b6c047afdad924b973d61c85`.
- The homepage contains existing crop-help and AI image-analysis UI. These are protected from this change.
- No automated browser run or live functional test has been executed in this session. Therefore all runtime regression checks remain **NOT RUN**, not passed.
- No verified staging deployment URL or isolated preview environment has been confirmed. Git branch isolation is not proof of a deployed staging site.

## Regression checklist — required before release
- [ ] Homepage and all existing MUKUL routes load; internal links and footer links resolve.
- [ ] Crop-help form: required fields, submit, validation, and error states.
- [ ] AI image-analysis: consent checkbox, upload constraints, request/error states, and results.
- [ ] Language selector and all existing translations.
- [ ] Responsive layouts at narrow mobile, tablet, and desktop widths; no horizontal overflow.
- [ ] Existing calculations and input/output pairs unchanged.
- [ ] Keyboard navigation, labels, focus visibility, and contrast.
- [ ] Network/API failures handled without exposing secrets or user data.
- [ ] New country configuration parses and unsupported countries/languages fail safely.
- [ ] Country-specific content is reviewed by local agricultural experts.
- [ ] Privacy notice, consent, data retention/deletion, and applicable local legal requirements reviewed.
- [ ] Backup/restore and rollback procedure tested.
- [ ] All blocking checks pass before opening a production release PR.

## Implementation status
This baseline record is committed on the staging branch before adding the isolated country configuration. Country profiles are proposals only; they do not enable new advice or alter the live site.
