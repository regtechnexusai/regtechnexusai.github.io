PRAGMA foreign_keys = ON;

-- Memberships are provisioned by an administrator; never auto-create a tenant from JWT or request data.
CREATE TABLE IF NOT EXISTS gaas_tenant_memberships (
  access_subject TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('tenant_admin','analyst','reviewer','viewer')),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gaas_tenant_memberships_tenant
  ON gaas_tenant_memberships(tenant_id, active);
