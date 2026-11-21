# Phase 2 P1 — Dependency Audit and Secret Scanning Plan

**Status:** Planned; no scan has been executed in this GitHub connector session.
**Scope:** Repository dependency and secret-exposure review; evidence capture and remediation.

## 1. Dependency audit
After the worker lockfile remediation is implemented:
- Capture Node.js and npm versions.
- Run `npm audit --json` for the Worker package and save the output as a protected CI artifact.
- Review direct and transitive findings; classify severity, exploitability/reachability, fixed version, and breaking-change risk.
- Avoid automated blanket upgrades. Remediate with targeted updates and regression testing.
- Re-run the audit after remediation and record residual findings with owner, rationale, and review date.

## 2. Secret scanning
- Scan current tracked files and the repository history with a reputable secret scanner (e.g., Gitleaks).
- Treat scanner results as leads until manually validated; never copy discovered credential values into issues, PRs, logs, or reports.
- If a credential exposure is confirmed: revoke/rotate it promptly, investigate access and usage, assess scope and impact, and document incident handling without exposing the secret.
- Record scanner version, scan scope (working tree/history), date, exit code, validated findings, false positives, and remediation/retest evidence.

## 3. CI guardrails
- Add or verify dependency-audit and secret-scanning jobs with least-privilege permissions.
- Fail CI on confirmed policy violations using reviewed thresholds; avoid unreviewed exceptions.
- Pin third-party GitHub Actions to immutable full commit SHAs where feasible and verify updates through review.
- Ensure artifacts and logs redact sensitive values and have appropriate retention.

## 4. Acceptance evidence
- Scan outputs are attached or referenced securely.
- Findings are triaged, assigned, and tracked.
- Confirmed exposed credentials are rotated and retested.
- Dependency fixes pass relevant unit/integration regression checks.
- A reviewer verifies residual risk and records the decision.

## Execution limitation
This document is a plan, not evidence of execution. The current connector session does not provide an npm runtime or repository-history scanning runtime, and workflow configuration inspection has been limited. No dependency audit or secret scan is claimed as run.
