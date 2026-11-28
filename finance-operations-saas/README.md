# Finance Operations SaaS — isolated sandbox foundation

This is a separate SaaS application scaffold. It does **not** replace or modify the existing public demo at `/finance-operations/`.

## Current delivery boundary

Implemented in this branch:
- Supabase email/password authentication UI and password-reset request.
- Runtime public configuration endpoint for Cloudflare Pages.
- Organisation onboarding RPC and organisation membership schema.
- PostgreSQL invoice persistence with organisation-scoped RLS.
- Owner/admin/finance-manager/collector/viewer role model.
- Invoice change audit events and CSV export.
- No credentials, project URL, anon key, service-role key, or other secrets are committed.

Not yet enabled:
- Supabase project provisioning and migration execution.
- Email provider/SMTP configuration and production redirect allow-list.
- SMTP delivery tuning, email template branding, invitation expiry/resend/revoke lifecycle.
- Payment reconciliation, recurring invoices, attachments, accounting integrations, and advanced reporting.
- Independent penetration test, backup-restore drill, and production sign-off.

## Sandbox prerequisites

1. Create a Supabase Free project manually in the RegTech Nexus AI account. This branch does not create paid services or provision cloud resources.
2. In Supabase SQL Editor, review and apply `supabase/migrations/202611280001_initial_saas_schema.sql`.
3. In Supabase Authentication settings, enable email/password and configure the sandbox site's allowed redirect URLs. Keep email confirmation enabled.
4. Create a Cloudflare Pages project connected to this repository. Set its **Root directory** to `finance-operations-saas` and build command to none / static output directory to `.`.
5. Set these Cloudflare Pages environment variables for **Preview only**:
   - `SUPABASE_URL` — project URL
   - `SUPABASE_ANON_KEY` — publishable anon key (public by design; still restrict with RLS)
6. Do not add `service_role`, database passwords, SMTP credentials, or other secrets to frontend variables or this repository.
7. Deploy the Supabase Edge Function with `supabase functions deploy invite-member` after linking the sandbox project. The function uses Supabase-managed `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in the server runtime; never copy the service-role key into Cloudflare or browser code.
8. Create a Cloudflare Pages Preview deployment and set Preview-only `SUPABASE_URL` and `SUPABASE_ANON_KEY` variables. No custom domain or DNS change is required for the first preview.
9. Run the Preview deployment and verify registration, email confirmation, login, organisation creation, invitation acceptance, cross-tenant isolation, role restrictions, invoice CRUD, and audit events before any production consideration.

Cloudflare Pages Functions are served from `functions/` relative to the configured project root. The `/api/config` endpoint returns only the Supabase URL and public anon key; it never returns server secrets.

## First-use onboarding and invitations

The sign-up form captures an organisation name. After email confirmation and first sign-in, the app calls `create_my_organisation(org_name)` and the database assigns the first user the `owner` role. Owners and admins can invite colleagues from Team Access. The Edge Function verifies the caller's JWT and organisation role, sends an Auth invitation, and stages a pending membership. The invited user receives the role after signing in and accepting the invitation through the database RPC. Admins may invite finance managers, collectors, and viewers; only owners may invite another admin. Invitation expiry, resend, revocation, and richer team-management controls remain future increments.

## Security notes

- All business tables have Row Level Security enabled.
- Invoice reads are limited to organisation members; writes are limited to owner/admin/finance-manager; deletion is limited to owner/admin.
- Audit event reads are owner/admin only. Audit rows are written by a database trigger and are not granted to application users for direct mutation.
- Never use the Supabase service-role key in a browser.
- Free-tier sandbox is for synthetic test data only. It is not approved for confidential or regulated financial records.
