PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS assurance_jobs (
 job_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, idempotency_key TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('queued','primary_research_running','gemini_review_running','openai_finalisation_running','openai_self_review_running','quality_gate','completed_pending_human_review','primary_report_fallback_self_review_unavailable','failed')),
 request_fingerprint TEXT NOT NULL, request_json TEXT, primary_report_json TEXT, final_report_json TEXT,
 assurance_status TEXT, failure_code TEXT, attempt_count INTEGER NOT NULL DEFAULT 0 CHECK(attempt_count>=0),
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL, expires_at TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 0 CHECK(version>=0),
 UNIQUE(tenant_id,idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_assurance_jobs_status_created ON assurance_jobs(status,created_at);
CREATE INDEX IF NOT EXISTS idx_assurance_jobs_expiry ON assurance_jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_assurance_jobs_tenant_created ON assurance_jobs(tenant_id,created_at);
CREATE TABLE IF NOT EXISTS assurance_job_events (
 event_id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT NOT NULL REFERENCES assurance_jobs(job_id) ON DELETE CASCADE,
 tenant_id TEXT NOT NULL, from_status TEXT, to_status TEXT NOT NULL, event_code TEXT NOT NULL, created_at TEXT NOT NULL, metadata_json TEXT, job_version INTEGER NOT NULL DEFAULT 0 CHECK(job_version>=0)
);
CREATE INDEX IF NOT EXISTS idx_assurance_job_events_job_created ON assurance_job_events(job_id,created_at);
CREATE INDEX IF NOT EXISTS idx_assurance_job_events_tenant_created ON assurance_job_events(tenant_id,created_at);
