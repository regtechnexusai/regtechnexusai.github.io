# Phase 2 — P1 Dependency & Secret Security Baseline
**Review date:** 2026-11-21  
**Status:** Evidence-based preliminary review; execution scans not yet performed  
**Scope:** Repository dependency hygiene and secret exposure risk. MUKUL, calculators, product logic, algorithms, and core workflows are excluded.

## Verified repository observations
- Root-level `package.json`: not found (GitHub contents API returned 404).
- Root-level `package-lock.json`: not found (GitHub contents API returned 404).
- `gaas/worker/package.json`: exists; `vitest` is pinned to `4.1.12` under devDependencies.
- `gaas/worker/package-lock.json`: not found (GitHub contents API returned 404).
- The Worker package scripts include unit tests and a separate integration-test command. A package manifest alone is not evidence that dependency resolution is reproducible or vulnerability-free.

**Interpretation:** A missing Worker lockfile is a reproducibility and supply-chain control gap. This review did not run an install, vulnerability audit, or secret-history scan. The 404 results establish that the queried files are absent at those paths at the time of inspection; they do not establish that dependencies are vulnerable or that secrets are present.

## P1 remediation checklist
1. Generate and commit a lockfile for `gaas/worker` using the repository's supported npm version and package settings.
2. In CI, use deterministic install (`npm ci`) after lockfile adoption; avoid `npm install` for CI dependency installation.
3. Run `npm audit --json` against the Worker dependency tree; triage advisories by direct/transitive dependency, severity, exploitability, reachability, and remediation compatibility.
4. Run a secret scan across current tracked files and Git history with a reputable scanner (e.g., Gitleaks). Review findings manually; do not publish secret values.
5. If exposure is confirmed, revoke/rotate affected credentials first, then remove/mitigate the leaked material and assess history, logs, access, and potential abuse. Removing a string from the latest commit is not sufficient.
6. Pin CI actions to full commit SHAs; review permissions using least privilege and ensure workflow tokens are read-only unless a job needs write access.
7. Record tool versions, scan timestamp, commit SHA, raw scan artifacts (sanitized), findings, owners, remediation dates, and retest outcomes.

## Required verification evidence
| Control | Evidence required | Status |
|---|---|---|
| Worker lockfile committed | Lockfile path, commit SHA | **Gap verified** |
| Reproducible CI install | CI workflow showing `npm ci` | Not verified |
| Dependency audit | Audit output + triage | Not run |
| Secret scan (working tree) | Sanitized scan report | Not run |
| Secret scan (Git history) | Sanitized scan report | Not run |
| Remediation and retest | PR/commit + test evidence | Pending |

## Commands for an authorized checkout
Run from `gaas/worker` after reviewing npm version and package settings:
```bash
npm install --package-lock-only
npm ci
npm audit --json
```
Secret scan (repository root; use Gitleaks and preserve sanitized results):
```bash
gitleaks detect --source . --report-format json --report-path gitleaks-report.json
```
Review historical scanning separately with the installed Gitleaks version's supported git-history mode/options. Do not upload raw secret-bearing reports to public artifacts.

## Assessment
**Preliminary P1 supply-chain concern:** lockfile/reproducibility gap in the Worker package.  
**Secret exposure:** unknown; no scan performed.  
**Dependency vulnerabilities:** unknown; no audit performed.  
**Phase 2:** remains OPEN. No maturity points awarded from this note alone.
