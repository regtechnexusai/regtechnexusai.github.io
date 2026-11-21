# Phase 2 P1 — Worker Lockfile Remediation Execution Plan

**Status:** Prepared; execution evidence is still required before marking remediation complete.
**Scope:** `gaas/worker` dependency reproducibility and CI validation only.

## Verified starting point
- `gaas/worker/package.json` declares Vitest `4.1.12` as a dev dependency.
- The package scripts include unit tests and a separate integration-test command.
- A worker lockfile was previously checked and reported absent.

## Required remediation (execute in the worker package directory)
1. Confirm the Node.js and npm versions used by CI and document/pin the supported Node version.
2. Generate the lockfile using the repository's supported npm version:
   `npm install --package-lock-only`
3. Review the generated `package-lock.json` for unexpected dependency changes; commit it alongside the package manifest.
4. In CI, use `npm ci` (with any required legacy peer-dependency option explicitly configured and justified) instead of unconstrained `npm install`.
5. Run the existing package scripts:
   - `npm test`
   - `npm run test:integration` in an environment that supports Node's experimental SQLite flag and required test services.
6. Run `npm audit --json`; triage findings by severity, reachability, and fix availability. Do not automatically apply breaking upgrades.
7. Preserve logs/artifacts and record versions, exit codes, findings, and remediation/retest evidence.

## Acceptance criteria
- Lockfile committed and consistent with package manifest.
- CI installation is reproducible with `npm ci`.
- Unit tests pass.
- Integration tests are run and their results are recorded (or explicitly blocked with reason).
- Dependency audit output is reviewed and high/critical findings are either remediated or formally risk-accepted.
- No secrets are placed in committed logs or artifacts.

## Execution limitation
This plan is not a claim that lockfile generation, installation, dependency auditing, secret scanning, or integration tests have been executed. Those steps require an npm-capable runtime and access to the repository workflow configuration. The GitHub connector session used to prepare this document could read the worker package manifest but could not access workflow files or run npm commands. A follow-up implementation PR must include actual lockfile and CI changes plus test/audit evidence.
