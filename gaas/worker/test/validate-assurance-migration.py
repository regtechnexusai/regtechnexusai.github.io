import sqlite3
from pathlib import Path

root = Path("migrations")
migration_files = sorted(root.glob("*.sql"))
assert len(migration_files) >= 2, "Expected ordered Phase B migrations"

# Upgrade-path test: migration 0002 must preserve and version pre-existing audit history.
legacy = sqlite3.connect(":memory:")
legacy.execute("PRAGMA foreign_keys = ON")
legacy.executescript(migration_files[0].read_text(encoding="utf-8"))
legacy.execute("""INSERT INTO assurance_jobs(job_id,tenant_id,idempotency_key,status,request_fingerprint,request_json,created_at,updated_at,expires_at) VALUES ('legacy-job','tenant_legacy_01','legacy-key-12345678','queued','fp','{}','2026-11-11','2026-11-11','2026-11-12')""")
legacy.execute("""INSERT INTO assurance_job_events(job_id,tenant_id,from_status,to_status,event_code,created_at) VALUES ('legacy-job','tenant_legacy_01','queued','primary_research_running','LEGACY_EVENT_1','2026-11-11T00:01:00Z')""")
legacy.execute("""INSERT INTO assurance_job_events(job_id,tenant_id,from_status,to_status,event_code,created_at) VALUES ('legacy-job','tenant_legacy_01','primary_research_running','gemini_review_running','LEGACY_EVENT_2','2026-11-11T00:02:00Z')""")
legacy.executescript(migration_files[1].read_text(encoding="utf-8"))
assert legacy.execute("SELECT event_code,job_version FROM assurance_job_events WHERE job_id='legacy-job' ORDER BY event_id").fetchall() == [("JOB_CREATED",0),("LEGACY_EVENT_1",1),("LEGACY_EVENT_2",2)]
legacy.close()

# Fresh-install test: apply all migrations in order.
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")
for migration_path in migration_files:
    db.executescript(migration_path.read_text(encoding="utf-8"))

columns = {row[1] for row in db.execute("PRAGMA table_info(assurance_jobs)")}
assert {"tenant_id","idempotency_key","request_fingerprint","version","expires_at"} <= columns
event_columns = {row[1] for row in db.execute("PRAGMA table_info(assurance_job_events)")}
assert "job_version" in event_columns

db.execute("""INSERT INTO assurance_jobs(job_id,tenant_id,idempotency_key,status,request_fingerprint,request_json,created_at,updated_at,expires_at) VALUES ('j1','tenant_123456','key-1234567890123456','queued','fp1','{}','2026-11-11','2026-11-11','2026-11-12')""")
assert db.execute("SELECT count(*) FROM assurance_job_events WHERE job_id='j1' AND event_code='JOB_CREATED' AND job_version=0").fetchone()[0] == 1
try:
    db.execute("""INSERT INTO assurance_jobs(job_id,tenant_id,idempotency_key,status,request_fingerprint,request_json,created_at,updated_at,expires_at) VALUES ('j2','tenant_123456','key-1234567890123456','queued','fp2','{}','2026-11-11','2026-11-11','2026-11-12')""")
    raise AssertionError("tenant idempotency uniqueness not enforced")
except sqlite3.IntegrityError:
    pass

db.execute("""INSERT INTO assurance_jobs(job_id,tenant_id,idempotency_key,status,request_fingerprint,request_json,created_at,updated_at,expires_at) VALUES ('j3','tenant_other_123','key-1234567890123456','queued','fp1','{}','2026-11-11','2026-11-11','2026-11-12')""")
db.commit()
try:
    with db:
        db.execute("UPDATE assurance_jobs SET status='primary_research_running',version=version+1 WHERE job_id='j1' AND version=0")
        db.execute("""INSERT INTO assurance_job_events(job_id,tenant_id,from_status,to_status,event_code,created_at,job_version) VALUES ('j1','tenant_123456','queued','primary_research_running','TEST','2026-11-11',1)""")
        db.execute("""INSERT INTO assurance_job_events(job_id,tenant_id,from_status,to_status,event_code,created_at,job_version) VALUES ('j1','tenant_123456','queued','primary_research_running','RACE_DUPLICATE','2026-11-11',1)""")
except sqlite3.IntegrityError:
    pass
assert db.execute("SELECT status,version FROM assurance_jobs WHERE job_id='j1'").fetchone() == ("queued",0)
assert db.execute("SELECT count(*) FROM assurance_job_events WHERE job_id='j1' AND job_version=1").fetchone()[0] == 0
db.execute("DELETE FROM assurance_jobs WHERE job_id='j1'")
assert db.execute("SELECT count(*) FROM assurance_job_events WHERE job_id='j1'").fetchone()[0] == 0
print("Assurance migrations PASS: fresh install, legacy audit backfill, initial trigger, tenant uniqueness, versioned event uniqueness, rollback, FK cascade")
