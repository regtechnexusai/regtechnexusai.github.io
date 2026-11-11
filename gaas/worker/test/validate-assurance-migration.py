import sqlite3
from pathlib import Path
migration = Path("migrations/0001_assurance_jobs.sql").read_text(encoding="utf-8")
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")
db.executescript(migration)
columns = {row[1] for row in db.execute("PRAGMA table_info(assurance_jobs)")}
assert {"tenant_id","idempotency_key","request_fingerprint","version","expires_at"} <= columns
db.execute("""INSERT INTO assurance_jobs(job_id,tenant_id,idempotency_key,status,request_fingerprint,request_json,created_at,updated_at,expires_at) VALUES ('j1','tenant_123456','key-1234567890123456','queued','fp1','{}','2026-11-11','2026-11-11','2026-11-12')""")
assert db.execute("SELECT count(*) FROM assurance_job_events WHERE job_id='j1' AND event_code='JOB_CREATED'").fetchone()[0] == 1
try:
 db.execute("""INSERT INTO assurance_jobs(job_id,tenant_id,idempotency_key,status,request_fingerprint,request_json,created_at,updated_at,expires_at) VALUES ('j2','tenant_123456','key-1234567890123456','queued','fp2','{}','2026-11-11','2026-11-11','2026-11-12')""")
 raise AssertionError("tenant idempotency uniqueness not enforced")
except sqlite3.IntegrityError: pass
db.execute("""INSERT INTO assurance_jobs(job_id,tenant_id,idempotency_key,status,request_fingerprint,request_json,created_at,updated_at,expires_at) VALUES ('j3','tenant_other_123','key-1234567890123456','queued','fp1','{}','2026-11-11','2026-11-11','2026-11-12')""")
try:
 with db:
  db.execute("UPDATE assurance_jobs SET status='primary_research_running',version=version+1 WHERE job_id='j1' AND version=0")
  db.execute("INSERT INTO assurance_job_events(job_id,tenant_id,from_status,to_status,event_code,created_at) VALUES ('missing','tenant_123456','queued','primary_research_running','TEST','2026-11-11')")
except sqlite3.IntegrityError: pass
assert db.execute("SELECT status,version FROM assurance_jobs WHERE job_id='j1'").fetchone() == ("queued",0)
db.execute("DELETE FROM assurance_jobs WHERE job_id='j1'")
assert db.execute("SELECT count(*) FROM assurance_job_events WHERE job_id='j1'").fetchone()[0] == 0
print("Assurance migration SQL checks PASS: schema, trigger, tenant uniqueness, rollback, FK cascade")
