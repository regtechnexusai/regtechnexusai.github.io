ALTER TABLE assurance_job_events ADD COLUMN job_version INTEGER NOT NULL DEFAULT 0;

-- Backfill existing audit history in event order before enforcing uniqueness.
UPDATE assurance_job_events
SET job_version = (
  SELECT COUNT(*) - 1
  FROM assurance_job_events AS prior
  WHERE prior.job_id = assurance_job_events.job_id
    AND prior.event_id <= assurance_job_events.event_id
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_assurance_job_events_job_version
ON assurance_job_events(job_id, job_version);
