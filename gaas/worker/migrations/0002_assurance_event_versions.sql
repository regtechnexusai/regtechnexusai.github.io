ALTER TABLE assurance_job_events ADD COLUMN job_version INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS idx_assurance_job_events_job_version
ON assurance_job_events(job_id, job_version);
