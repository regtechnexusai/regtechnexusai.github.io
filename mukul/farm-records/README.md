# MUKUL Farm Records — v0.5 preview

Static, bilingual Bangla/English prototype for recording farm and lab soil-test details, generating a completeness summary and practical next-step report, and printing/exporting that report. Local-first: data is stored in the current browser only. No login, cloud sync, diagnosis, or fertilizer/pesticide dosage estimates.

## Publish location
Intended path: https://regtechnexusai.com/mukul/farm-records/ . This directory is separate from the existing MUKUL homepage at /mukul/; it does not replace it.

## Important pre-launch checks
- Confirm HTTPS and manifest/service-worker behavior after the PR is merged and the existing Pages deployment completes.
- Test current Chrome/Edge and Android installation, offline behavior, cache update, CSV, report print/PDF, mobile layout and accessibility in real browsers.
- Review Bangla/English wording and source applicability with agricultural specialists.
- Do not collect sensitive or confidential data; browser storage is not an encrypted vault and has no backup.
- Recheck current free-hosting terms and quotas. GitHub Pages is for static hosting and is not intended as free hosting for commercial SaaS or online business: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

This is a prototype, not a fully audited or certified agriculture advisory system.