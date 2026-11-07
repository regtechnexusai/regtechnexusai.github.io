# AlfiQ — Phase 1 Implementation Plan

Status: Ready for implementation planning; no application code deployed.
Parent architecture: [AlfiQ Production SaaS Blueprint](./alfiq-production-saas-blueprint.md)

## Approved constraints

- Development budget: BDT 0 / zero-cost.
- Initial document scope: public regulatory documents only.
- Intended market: international.
- Paid tools, APIs, hosting, subscriptions, domains, contractors and other charges: prohibited unless separately approved in writing.
- Existing GitHub Pages pages, pricing, calculators, algorithms and unrelated website functionality: preserve unchanged.
- No production/customer data in local development; use synthetic fixtures and public regulatory documents.

## Phase 1 objective

Create a reproducible local SaaS foundation with explicit frontend/API separation, tenant-aware data structures, role-based authorisation primitives, audit events, automated tests and clear setup instructions. Phase 1 is a development foundation, not a production SaaS release.

## Proposed zero-cost development stack

| Layer | Initial choice | Rationale / boundary |
|---|---|---|
| Frontend | React + TypeScript + Vite | Lightweight local development; no paid hosting required |
| API | Python + FastAPI | Typed request/response contracts and OpenAPI |
| Database | PostgreSQL via local Docker Compose | Production-relevant relational model without hosted database spend |
| Data access | SQLAlchemy + Alembic | Explicit migrations and testable persistence |
| Authentication | OIDC integration boundary; local development-only identity adapter | Avoid home-grown production password handling; real identity provider selection deferred |
| Tests | Pytest + frontend unit tests + API integration tests | Local and CI execution |
| CI | GitHub Actions where included within available free allowance | No paid runner or add-on |
| File storage | Local development adapter only | No customer uploads or public production endpoint in this phase |
| AI | Disabled / provider-neutral interface only | No API key, external model call or inference spend |

Use pinned, supported dependency versions at implementation time. Verify current licensing and security advisories before adoption. Do not introduce dependencies requiring paid licences.

## Proposed repository boundary

Create a separate application directory (for example, `apps/alfiq-saas/`) within the existing repository only if the repository's current build/deployment configuration can safely exclude it from GitHub Pages. Otherwise create a separate private/public repository only after confirming repository visibility and access implications with the owner.

Do not put backend services, secrets, environment files, database dumps or private documents in the public GitHub Pages deployment. Do not change root build configuration or live routing without a reviewed PR and regression checks.

## Phase 1 work packages

### P1. Repository and environment isolation
- Inspect current GitHub Pages build/deployment workflow and repository visibility.
- Decide isolated directory versus separate repository based on deployment exclusion and source visibility.
- Add documented local setup, example environment file with placeholders only, and ignore rules.
- Ensure no secrets, real user data, private keys or database files are committed.

Acceptance:
- Existing GitHub Pages output and routes are unchanged.
- SaaS development files cannot be published as executable backend assets by the Pages workflow.
- Fresh local setup succeeds from documented commands.

### P2. API and frontend skeleton
- Create health/readiness endpoints that expose no sensitive configuration.
- Define versioned API prefix (for example `/api/v1`).
- Add typed error responses, request validation, pagination conventions and correlation IDs.
- Create frontend shell with accessible navigation, loading, empty, error and session-expired states.

Acceptance:
- OpenAPI schema is generated and checked.
- Frontend can call local API.
- Basic accessibility and unit tests pass.

### P3. Tenant and identity foundation
- Model organisation, user, membership and role.
- Define roles: Platform Administrator, Organisation Administrator, Analyst, Reviewer and Read-only Viewer.
- Enforce tenant scope on the server, not from client-supplied tenant IDs.
- Deny by default; check access on every object read/write/export.
- Keep identity-provider integration abstract; do not implement insecure custom production authentication.

Acceptance:
- Automated negative tests prove a user in Tenant A cannot read, change, enumerate or export Tenant B records.
- Role matrix tests cover allowed and denied actions.
- No production authentication claim.

### P4. Regulatory source and document metadata
- Model jurisdiction, issuing authority, source URL, instrument type, publication/effective dates, binding-status classification, retrieval timestamp, document hash and version lineage.
- Separate shared public-source metadata from tenant-specific review notes and impact assessments.
- Start with manual registration/import of selected official public documents; no unrestricted crawler.

Acceptance:
- Source records preserve URL, jurisdiction, authority and instrument classification.
- Every stored document version has a cryptographic hash and provenance metadata.
- Unsupported or unverifiable source status is labelled unverified.

### P5. Audit and governance foundation
- Record actor, tenant, action, target object, timestamp, outcome and correlation ID for material events.
- Never log passwords, tokens, secrets or full sensitive document contents.
- Add data export/deletion design notes; implementation can follow in later phases.
- Add clear human-review status fields; no AI output can be marked approved automatically.

Acceptance:
- Tests verify audit events are generated for material actions.
- Audit records are tenant-scoped and protected from ordinary user modification.
- Reviewer and approval timestamps are attributable.

### P6. Quality gates
- Unit tests, API integration tests, schema migration tests and tenant isolation tests.
- Dependency lockfiles and automated vulnerability checks where free.
- Secret scanning and checks for accidental environment/database files.
- Documentation of known limitations and reproducible test commands.

Acceptance:
- CI passes on a clean branch.
- No known critical/high dependency finding is knowingly introduced without documented risk acceptance.
- No paid dependency or service appears in the build.

## Phase 1 exclusions

- Public production hosting or customer onboarding
- Production authentication provider, MFA/SSO deployment
- Customer confidential documents or personal data
- Automated web crawling or continuous regulatory monitoring
- AI inference, embeddings or paid model APIs
- OCR for scanned documents unless a free local option is separately evaluated
- Billing, subscriptions, payment processing and email delivery
- SLA, uptime or security certification claims

## International readiness principles

- Use ISO 3166 country/jurisdiction identifiers where applicable, with room for supranational authorities.
- Store timestamps in UTC and preserve source-local dates/time zones where relevant.
- Store original document language and do not silently translate authoritative text.
- Keep instrument type and legal/binding status separate from jurisdiction.
- Do not assume a single global definition of regulator, circular, rule, guidance or effective date.
- Build a source catalogue only from official or otherwise explicitly approved public sources.
- Select pilot jurisdictions after assessing source availability, language, document formats and legal review capacity.

## Definition of done

Phase 1 is complete only when:
1. A clean local setup is reproducible from documentation.
2. Existing GitHub Pages routes and behaviour pass regression checks.
3. API schema and database migrations are version-controlled.
4. Tenant and role isolation tests pass, including cross-tenant negative cases.
5. Audit-event tests pass.
6. Public-source metadata and version provenance tests pass.
7. CI passes without paid dependencies or secrets.
8. Limitations and non-production status are clearly documented.

Passing Phase 1 does not authorise production deployment or customer use. Production readiness requires the later security, privacy, hosting, identity, operational and independent assessment gates in the parent blueprint.
