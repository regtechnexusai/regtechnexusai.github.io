# Phase B — Cloudflare Access and tenant provisioning checklist

## Scope and safety

This checklist applies only to the isolated Phase B test Worker:

- Worker: `gaas-phaseb-queue-test`
- URL: `https://gaas-phaseb-queue-test.regtechnexusai.workers.dev`
- D1: `gaas-phaseb-disposable-20261111`
- Queue: `gaas-phaseb-test-jobs`
- DLQ: `gaas-phaseb-test-dlq`

Do not attach this test Access application to the production GaaS Worker or production hostname. Do not enable Phase B on production. Do not share API tokens, JWTs, cookies, or secret values in chat or screenshots.

## Required Cloudflare Dashboard actions

1. Open **Zero Trust → Access → Applications**.
2. Add a **Self-hosted** application for the isolated Worker hostname above. If the dashboard does not accept a `workers.dev` hostname, stop and ask for a dedicated test-only custom hostname; do not substitute the production hostname.
3. Create an allow policy restricted to the designated test email identity. Do not use an unrestricted Everyone policy.
4. Save the application and copy its **Application Audience (AUD) Tag**.
5. Note the Zero Trust team domain. The issuer must be exactly `https://<team-name>.cloudflareaccess.com`.
6. Keep the application restricted to the test user until the acceptance tests are complete.

## Worker variables

Set these non-secret variables on the isolated Worker only:

- `ACCESS_ISSUER`: exact team issuer URL above.
- `ACCESS_AUD`: the isolated Access application's AUD tag.

Do not set these on `gaas-research-api`, `gaas-research-api-staging`, or any production Worker.

## Tenant membership

The application authenticates a user; it does not automatically grant a tenant. A platform administrator must explicitly provision the user's immutable Access JWT `sub` claim in the isolated D1 table `gaas_tenant_memberships`.

Allowed roles are:

- `tenant_admin`
- `analyst`
- `reviewer`
- `viewer`

Only `tenant_admin` and `analyst` may submit jobs. All active roles may read jobs belonging to their own tenant. A missing or inactive membership must be denied.

Never derive `tenant_id` or role from browser request fields, query parameters, or custom headers. Never auto-create membership from an authenticated login.

## Acceptance evidence required

- No token: HTTP 401.
- Invalid signature, issuer, audience, expired token: HTTP 401.
- Valid Access identity with no active membership: HTTP 403.
- Active membership: tenant and role loaded from D1 using the JWT `sub`.
- Tenant A cannot read Tenant B's job (HTTP 404).
- `viewer` and `reviewer` cannot submit jobs (HTTP 403).
- `analyst` or `tenant_admin` can submit only allowlisted, non-sensitive test data.
- GET status requests succeed from the approved web origin with CORS.
- The isolated test app and membership are removed or disabled after acceptance.

## Values to provide to the implementation team

Only provide the non-secret **team issuer URL** and **Access application AUD tag** through an approved secure configuration workflow. Do not provide JWTs, API tokens, cookies, or passwords. If the Worker variables and D1 membership must be configured by the account owner, retain the values in Cloudflare's secure dashboard and share only a redacted confirmation screenshot.
