# Phase 2 Security & International Assurance — Evidence Baseline

**Review date:** 2026-11-20  
**Repository:** `regtechnexusai/regtechnexusai.github.io`  
**Tracking:** [Issue #493](https://github.com/regtechnexusai/regtechnexusai.github.io/issues/493)  
**Branch:** `phase2/security-governance-evidence-20261120`

## Scope and exclusions

This baseline covers security, privacy, AI governance, vulnerability disclosure, and international assurance only. It deliberately excludes MUKUL Agriculture Hub, PayScale, the MD/CEO KPI calculator, all calculators, formulas, algorithms, routine styling, and core product functionality.

This is a source-file review. It is not a live HTTP test, secret-history scan, dependency scan, penetration test, privacy assessment, or certification audit.

## Evidence reviewed

- `index.html` — homepage CSP meta policy, analytics bootstrap, third-party script origins, public AI assistant link, and public disclosures.
- `gaas/index.html` — GaaS CSP meta policy, Turnstile script, staging endpoint, preview status and disclosure.
- `privacy.html` — privacy notice covering contact form transmission, Cloudflare Worker/Turnstile, Resend email delivery, analytics, GaaS structured inputs and known verification limitations.
- `.well-known/security.txt` — disclosure contact, expiry, language, canonical URL and policy link.
- `SECURITY-HARDENING-2026-11.md` — previously documented hosting/header limitations and outstanding verification gates.
- `.github/workflows/deploy-pages.yml` — Pages build/deploy permissions, SHA-pinned actions, pinned upstream checkout references and npm package downloads.
- `.github/workflows/gaas-worker-staging-deploy.yml` — staging Worker tests, dependency audit, deployment environment, secret/variable use and health check.
- `.github/workflows/gaas-worker-tests.yml` — Worker unit/integration workflow and token permissions.
- `.github/workflows/functional-regression.yml` — browser regression workflow, read-only production tests and artifact retention.
- `gaas/worker/package.json` — Vitest dependency pin and scripts; no lockfile was confirmed in the reviewed file list.

## Confirmed positive controls (source evidence only)

| Control | Evidence | Status |
|---|---|---|
| Homepage CSP meta policy is present before analytics bootstrap | `index.html` | IMPLEMENTED (source) |
| GaaS page has a separate restrictive CSP meta policy | `gaas/index.html` | IMPLEMENTED (source) |
| CSP `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` on reviewed pages | Page CSP source | IMPLEMENTED (source) |
| Analytics script origins are explicitly listed in homepage CSP | `index.html` | IMPLEMENTED (source) |
| Turnstile and staging Worker origins are explicitly listed in GaaS CSP | `gaas/index.html` | IMPLEMENTED (source) |
| GitHub Actions reviewed workflows declare permissions rather than rely on implicit broad defaults | Reviewed workflow files | IMPLEMENTED (source) |
| Actions in reviewed workflows are pinned to full commit SHAs | Reviewed workflow files | IMPLEMENTED (source) |
| TradeGuard and PayScale deployment checkouts use explicit commit refs | `deploy-pages.yml` | IMPLEMENTED (source; PayScale excluded from remediation scope) |
| security.txt exists with contact, languages, canonical URL and expiry | `.well-known/security.txt` | IMPLEMENTED (source) |
| Privacy notice discloses contact-form data flow through Worker/Turnstile to Resend | `privacy.html` | IMPLEMENTED (disclosure) |
| GaaS preview boundaries and no document upload are disclosed | `gaas/index.html` and `privacy.html` | IMPLEMENTED (disclosure) |

## Findings register

| ID | Finding | Severity | Evidence | Affected component | Remediation / action |
|---|---|---|---|---|
| P2-01 | HTTP response headers and redirects have not been verified from source inspection alone. Meta policies do not replace response headers. | Medium | No live header capture in this review. | Cloudflare/edge, Pages | Obtain authorized response-header and redirect evidence; configure headers at the active edge if supported; test deployed result. |
| P2-02 | The existing CSPs have not been demonstrated compatible through browser tests or violation monitoring. | Medium | Policies exist in HTML; no CSP compatibility test evidence reviewed. | Homepage, GaaS, scripts/integrations | Run browser tests with console/CSP reporting; avoid broad policy tightening until violations and dependencies are inventoried. |
| P2-03 | Worker dependency installation uses `npm install` without a confirmed committed lockfile, reducing deterministic CI installs. | Medium | Reviewed Worker workflow files use `npm install --legacy-peer-deps`; reviewed `package.json` has Vitest pin but lockfile not confirmed. | GaaS Worker CI | Verify lockfile exists in repository. If absent, generate and review it in a network-enabled environment, commit it, and migrate to `npm ci` after validating compatibility. |
| P2-04 | Workflow permissions are limited at workflow level, but no job-level permission audit or ruleset/branch-protection evidence is available. | Low/Medium | Reviewed YAML; repository settings not inspected. | GitHub Actions/repository settings | Review job-level permissions, environments, required checks, branch protection, secret scanning and push protection in GitHub settings. |
| P2-05 | Privacy notice explicitly states that provider chain, processing locations, retention, logging and deletion arrangements for GaaS are not independently verified. | Medium | `privacy.html` disclosure. | GaaS staging/privacy | Obtain provider configuration and contractual evidence; confirm retention/logging/data locations; update notice only when facts are verified. |
| P2-06 | AI governance evidence is not consolidated into a version-controlled framework with accountable ownership and lifecycle controls. | Medium | Public preview disclosures and reviewed page content; no complete governance register reviewed. | AlfiQ GaaS | Publish and maintain the companion AlfiQ governance framework; validate its statements against actual deployment/configuration before operational use. |
| P2-07 | security.txt response capability, expiry monitoring and operational ownership have not been externally verified. | Low/Medium | File content exists; live endpoint and inbox monitoring not tested. Expiry currently listed as 2027-10-01. | Vulnerability disclosure | Verify live path, contact reachability, policy link and expiry. Assign a responsible person and renewal reminder; do not imply 24/7 response. |
| P2-08 | Secret exposure and dependency vulnerability status are unknown because repository history scans and dependency scans were not executed in this review. | High (unknown exposure; not a confirmed vulnerability) | No scan evidence. | Repository history, dependencies, Worker | Run secret-history and dependency scans in authorized CI; treat this as an evidence gap, not a confirmed leak. Do not print secret values. |

## Test status

All tests below are **NOT RUN** in this source-only review:

- Build and deployment validation
- HTML validation
- JavaScript lint/syntax across repository
- Existing regression suites
- Browser functional tests
- CSP compatibility/violation tests
- HTTP headers, redirects, TLS and mixed-content checks
- Dependency audit
- Secret-history scan
- Branch protection / ruleset verification
- Cloudflare account configuration review
- External independent penetration test

## Prioritized actions

1. **P1 — Secret and dependency scans:** run authorized secret-history and dependency scans; if an active credential is exposed, notify owner and rotate/revoke manually through provider console.
2. **P1 — Live edge verification:** capture HTTPS/HTTP redirect, TLS, security headers, CSP, mixed content, and `security.txt` responses. Apply missing edge headers only through the confirmed active provider configuration.
3. **P1 — CSP compatibility:** exercise representative public routes and workflows; gather browser console/CSP reports. Keep current policy until a tested change is ready.
4. **P2 — Reproducible Worker dependencies:** verify lockfile; if absent, generate/commit after dependency review, then adopt `npm ci`.
5. **P2 — GitHub governance settings:** review rulesets, required checks, environment protections, secret scanning and push protection.
6. **P2 — Privacy evidence:** verify GaaS provider chain, processing region, retention/logging, deletion, and relevant contractual terms.
7. **P2 — AlfiQ governance:** maintain the companion governance policy and validate it against actual code and provider settings.
8. **P3 — Independent assessment:** obtain a scoped external security assessment after internal remediation and evidence collection.

## Framework mapping status

This baseline is a crosswalk starter, not a conformity assessment. The companion mapping must be updated with evidence and control owners. No ISO certification, NIST conformity, independent verification, or production-security claim is made.

## Evidence integrity

Source review findings are labelled as source evidence. Controls requiring deployed behaviour, account settings, test execution, logs, or independent review remain **NOT EVIDENCED** until that evidence is collected. This report assigns no numerical score.
