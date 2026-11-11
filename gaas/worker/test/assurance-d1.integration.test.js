import { describe, it, expect } from "vitest";
import { env } from "cloudflare:workers";
import { transitionAssuranceJob } from "../src/assurance-jobs.js";

const tenantId = "tenant_d1_integration";
const now = "2026-11-11T16:00:00.000Z";

async function seedJob(status = "queued") {
  const suffix = crypto.randomUUID().replace(/-/g, "");
  const jobId = `d1-${suffix}`;
  await env.DB.prepare(`
    INSERT INTO assurance_jobs (
      job_id, tenant_id, idempotency_key, status, request_fingerprint,
      request_json, created_at, updated_at, expires_at, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).bind(
    jobId, tenantId, `key-${suffix}`, status, `fp-${suffix}`,
    '{"jurisdiction":"GB","topic":"integration test"}',
    now, now, "2026-11-12T16:00:00.000Z"
  ).run();
  return jobId;
}

describe("Cloudflare Workers runtime + D1 assurance integration", () => {
  it("applies migrations and creates the initial version-zero audit event", async () => {
    const jobId = await seedJob();
    const row = await env.DB.prepare(
      "SELECT status, version FROM assurance_jobs WHERE tenant_id=? AND job_id=?"
    ).bind(tenantId, jobId).first();
    const event = await env.DB.prepare(
      "SELECT job_version, event_code FROM assurance_job_events WHERE tenant_id=? AND job_id=?"
    ).bind(tenantId, jobId).first();
    expect(row).toEqual({ status: "queued", version: 0 });
    expect(event).toEqual({ job_version: 0, event_code: "JOB_CREATED" });
  });

  it("performs a real D1 batch transition and writes its matching audit version", async () => {
    const jobId = await seedJob();
    const updated = await transitionAssuranceJob(env.DB, {
      tenantId, jobId, expectedVersion: 0,
      toStatus: "primary_research_running",
      eventCode: "PRIMARY_RESEARCH_STARTED",
      now: new Date(now),
    });
    expect(updated.status).toBe("primary_research_running");
    expect(updated.version).toBe(1);
    const events = await env.DB.prepare(
      "SELECT from_status, to_status, job_version FROM assurance_job_events WHERE tenant_id=? AND job_id=? ORDER BY event_id"
    ).bind(tenantId, jobId).all();
    expect(events.results).toEqual([
      { from_status: null, to_status: "queued", job_version: 0 },
      { from_status: "queued", to_status: "primary_research_running", job_version: 1 },
    ]);
  });

  it("allows only one concurrent transition from the same expected version", async () => {
    const jobId = await seedJob();
    const attempt = () => transitionAssuranceJob(env.DB, {
      tenantId, jobId, expectedVersion: 0,
      toStatus: "primary_research_running",
      eventCode: "CONCURRENT_START",
      now: new Date(now),
    });
    const outcomes = await Promise.allSettled([attempt(), attempt()]);
    expect(outcomes.filter(x => x.status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter(x => x.status === "rejected")).toHaveLength(1);
    const job = await env.DB.prepare(
      "SELECT status, version FROM assurance_jobs WHERE tenant_id=? AND job_id=?"
    ).bind(tenantId, jobId).first();
    const count = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM assurance_job_events WHERE tenant_id=? AND job_id=?"
    ).bind(tenantId, jobId).first();
    expect(job).toEqual({ status: "primary_research_running", version: 1 });
    expect(count.count).toBe(2);
  });

  it("rolls back the job update when the audit insert fails inside D1 batch", async () => {
    const jobId = await seedJob();
    const triggerName = `abort_event_${crypto.randomUUID().replace(/-/g, "")}`;
    await env.DB.exec(`
      CREATE TRIGGER ${triggerName}
      BEFORE INSERT ON assurance_job_events
      WHEN NEW.event_code = 'FORCE_AUDIT_FAILURE'
      BEGIN
        SELECT RAISE(ABORT, 'forced audit insert failure');
      END;
    `);
    try {
      await expect(transitionAssuranceJob(env.DB, {
        tenantId, jobId, expectedVersion: 0,
        toStatus: "primary_research_running",
        eventCode: "FORCE_AUDIT_FAILURE",
        now: new Date(now),
      })).rejects.toThrow();
      const job = await env.DB.prepare(
        "SELECT status, version FROM assurance_jobs WHERE tenant_id=? AND job_id=?"
      ).bind(tenantId, jobId).first();
      const count = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM assurance_job_events WHERE tenant_id=? AND job_id=?"
      ).bind(tenantId, jobId).first();
      expect(job).toEqual({ status: "queued", version: 0 });
      expect(count.count).toBe(1);
    } finally {
      await env.DB.prepare(`DROP TRIGGER IF EXISTS ${triggerName}`).run();
    }
  });

  it("does not allow another tenant to transition or read a job", async () => {
    const jobId = await seedJob();
    await expect(transitionAssuranceJob(env.DB, {
      tenantId: "tenant_d1_other",
      jobId,
      expectedVersion: 0,
      toStatus: "primary_research_running",
      eventCode: "CROSS_TENANT_ATTEMPT",
      now: new Date(now),
    })).rejects.toThrow("JOB_NOT_FOUND");
    const count = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM assurance_job_events WHERE job_id=? AND event_code='CROSS_TENANT_ATTEMPT'"
    ).bind(jobId).first();
    expect(count.count).toBe(0);
  });
});
