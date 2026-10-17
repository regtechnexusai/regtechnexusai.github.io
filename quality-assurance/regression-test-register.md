# Regulatory Source Register & Regression Test Protocol

Owner: RegTech Nexus AI  
Baseline: 2026-10-17  
Cadence: monthly and after material releases or regulatory updates  
Principle: detect and report; do not silently alter production logic.

## A. Regulatory freshness

For each source mapped to a page, calculator or diagnostic pack, record issuer/jurisdiction, exact instrument title and number, official URL, publication/revision date, effective date, transition dates, supersession status, instrument class, scope/applicability assumptions, affected tool/module, reviewer, review date and change summary.

Monthly procedure:
1. Open the official issuer portal and specific instrument.
2. Compare current version, amendment history, commencement and transition dates.
3. Check later instruments for repeal, correction, supersession or qualification.
4. Reconcile affected mappings, formulas/assumptions and explanatory copy.
5. Retain evidence and reviewer details; a working URL is not evidence of freshness.
6. If uncertain, record INSUFFICIENT EVIDENCE — VERIFICATION REQUIRED.

## B. Automated static regression

Run on pull requests, pushes to main, and monthly:
- Required critical HTML files exist and are non-empty.
- Critical pages have a title, viewport and canonical metadata.
- Duplicate HTML IDs are detected.
- Local links/assets and document fragments are checked against repository files.
- Empty/placeholder links are reported.
- Findings are uploaded as a workflow artifact; the script does not edit production files.

Critical pages: homepage; Tool Assurance; Regulatory Source Register; Bank-use Review; Policy Gap Analyzer; ICMS Toolkit; International Regulatory Calculators; PayScale 2026; MD/CEO Performance Calculator; Explainable AI; Derivatives.

TradeGuard's canonical implementation path must be confirmed before adding a repository file to the required-page list. Do not create a substitute or change its public URL without investigating the current deployment.

## C. Manual functional regression

Use synthetic test vectors and independently calculated expected results:
1. Normal/happy-path inputs.
2. Minimum/maximum values, empty fields, invalid types and boundaries.
3. Formula/rule outputs compared to expected results.
4. CSV/PDF/print output reconciled with on-screen results where supported.
5. Refresh/back/forward and browser storage behaviour.
6. Keyboard and mobile-layout smoke tests.
7. Browser console errors and failed network requests.
8. Human-review warnings and non-decision-ready messages remain visible.

Never enter confidential bank/customer data into public test pages. Source-code inspection is not live functional testing; static link checking is not penetration testing.

## D. Severity and release gate

- Critical: material calculation/decision-support failure, misleading regulatory status, sensitive-data exposure or broken flagship workflow.
- High: stale/superseded source materially affects a conclusion, a material control mapping is wrong, or a flagship destination is unavailable.
- Medium: incomplete version metadata, broken secondary navigation or partial export/layout regression.
- Low: cosmetic/editorial defect without material interpretation impact.

Critical/High findings require an owner, remediation and re-test before release of the affected feature. The initial workflow reports findings as an artifact rather than blocking deployments while the existing baseline is established.

## E. Evidence record

Retain run date/time, commit SHA, pages checked, failed URLs/IDs, manual test evidence, reviewer, severity, owner, target date and re-test outcome. A green static check is not certification of regulatory correctness, security, accessibility or end-to-end functionality.
