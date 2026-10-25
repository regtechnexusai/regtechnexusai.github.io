# Digital Bank Supervisory Readiness Framework (DBSRF) — Phase 1 core

This is an **additive, isolated development module** under the existing FinTech Intelligence Hub. It does not replace or modify ICMS, TradeGuard, regulatory calculators, existing scoring logic, or site architecture.

## Included in this change

- `engine/dbsrf-core.js`: dependency-free core assessment engine, seven pillars and 28 core questions.
- `tests/dbsrf-core.test.js`: automated tests using Node's built-in test runner.
- This README: scoring contract and boundaries.

## Scoring contract

- Question maturity score: integer 0–4.
- Pillar score: sum of assessed scores divided by (4 × assessed questions in that pillar), expressed as a percentage.
- Overall maturity: equal-weighted average of pillar percentages; available only when every question is assessed or has an approved, applicability-verified N/A status and at least five pillars contain assessed questions.
- N/A requires a written justification. It is considered resolved only when applicability verification and an approver identifier are recorded. Approved N/A questions are excluded from the score denominator and disclosed.
- An all-N/A pillar has no score and does not count toward minimum pillar coverage.
- Critical gates are reported separately and take precedence over maturity in the reporting status. A low score alone is not a confirmed legal or supervisory failure. A confirmed critical failure requires explicit reviewer confirmation and at least one linked evidence ID.
- Evidence confidence (High, Moderate, Low, Unverified) is separate from the maturity score.

## Run tests

From the repository root, with Node.js installed:

```sh
node --test fintech-intelligence-hub/digital-bank-readiness/tests/dbsrf-core.test.js
```

## Important boundaries

The maturity bands are internal methodology labels, not regulator ratings. This engine does not determine licensing eligibility, legal compliance, financial soundness, or supervisory approval. Jurisdiction-specific legal mapping must be independently verified against current official sources and is intentionally not asserted by this Phase 1 core.

The module is not yet a production assessment interface. Evidence inventory, encrypted export/import, persistence, security review, jurisdiction modules and live-browser integration remain separate follow-on work. Do not describe the prototype as zero-knowledge or regulator-approved.
