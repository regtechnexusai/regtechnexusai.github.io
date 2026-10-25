# Digital Bank Supervisory Readiness Framework (DBSRF) — Phase 1 core

This is an **additive, isolated Phase 1 module** under the existing FinTech Intelligence Hub. A standalone assessment interface is available at `index.html` and is linked from the Hub. It does not replace or modify ICMS, TradeGuard, regulatory calculators, existing scoring logic, or the site's existing architecture.

## Included in this change

- `engine/dbsrf-core.js`: dependency-free core assessment engine, seven pillars and 28 core questions.
- `engine/dbsrf-evidence.js`: evidence inventory validation, many-to-many question mapping and per-question relevance/sufficiency review.
- `engine/dbsrf-storage.js`: password-protected export/import using PBKDF2-SHA-256 and AES-256-GCM through Web Crypto; no plaintext fallback.
- `assets/dbsrf-ui.js` and `assets/dbsrf-ui.css`: responsive, standalone browser interface with no external analytics or network connection configured; assessment data remains in memory until the user exports it.
- `index.html`: the DBSRF interface, linked from the existing FinTech Intelligence Hub.
- `tests/*.test.js`: automated scoring, evidence and encrypted-storage tests using Node's built-in test runner.
- This README: scoring contract and boundaries.

## Scoring contract

- Question maturity score: integer 0–4.
- Pillar score: sum of assessed scores divided by (4 × assessed questions in that pillar), expressed as a percentage.
- Overall maturity: equal-weighted average of pillar percentages; available only when every question is assessed or has an approved, applicability-verified N/A status and at least five pillars contain assessed questions.
- N/A requires a written justification of at least 20 non-whitespace characters. It is considered resolved only when applicability verification and an approver identifier are recorded. Approved N/A questions are excluded from the score denominator and disclosed.
- A critical-gate N/A is never treated as a passed gate. Even when applicability is verified and approved, it is flagged as a governance exception requiring escalation, and the aggregate maturity score is withheld until the exception is resolved.
- An all-N/A pillar has no score and does not count toward minimum pillar coverage.
- Critical gates are reported separately and take precedence over maturity in the reporting status. A low score alone is not a confirmed legal or supervisory failure. A confirmed critical failure requires explicit reviewer confirmation and an evidence artifact in the inventory that is linked to that same question, has `Reviewed` status, and has question-specific `Relevant`/`Sufficient` review with reviewer and valid review date.
- Score override policy: a confirmed critical failure does not falsify or erase the calculated numeric maturity score; it remains visible for diagnostic transparency, but the reporting status explicitly overrides any readiness interpretation and the maturity band is labeled diagnostic-only. A critical-gate N/A exception withholds the aggregate score. If both conditions occur, the critical failure is reported and the score is withheld because of the N/A exception.
- Evidence confidence (High, Moderate, Low, Unverified) is separate from the maturity score.

## Run tests

From the repository root, with Node.js installed:

```sh
node --test fintech-intelligence-hub/digital-bank-readiness/tests/*.test.js
```

## Important boundaries

The maturity bands are internal methodology labels, not regulator ratings. This engine does not determine licensing eligibility, legal compliance, financial soundness, or supervisory approval. Jurisdiction-specific legal mapping must be independently verified against current official sources and is intentionally not asserted by this Phase 1 core.

The interface is an early-stage prototype, not a production supervisory assessment product. Jurisdiction modules, accessibility/usability review, browser privacy/network verification and independent security review remain follow-on work. Password-protected export protects the exported file when used correctly; it does not by itself secure browser memory, the device, or a compromised page. Do not describe the prototype as zero-knowledge or regulator-approved.
