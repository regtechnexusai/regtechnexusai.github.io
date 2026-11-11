import { describe, expect, it, vi } from "vitest";
import {
  createAssuranceJob, getAssuranceJob, transitionAssuranceJob,
  validateJobInput, isRetryableQueueError, queueRetryDelaySeconds,
  handleAssuranceQueueMessage
} from "../src/assurance-jobs.js";

const input = {
  jobId: "job_1234567890123456",
  idempotencyKey: "gaas:case:1234567890123456",
  requestFingerprint: "a".repeat(64),
  retentionSeconds: 86400,
  request: { jurisdiction: "GB", topic: "AML/CFT" }
};

function fakeD1() {
  const state = { row: null, events: [] };
  return {
    state,
    prepare(sql) {
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        async run() {
          if (sql.startsWith("INSERT INTO assurance_jobs")) {
            if (!state.row) state.row = {
              job_id: args[0], idempotency_key: args[1], status: "queued",
              request_fingerprint: args[2], request_json: args[3],
              created_at: args[4], updated_at: args[5], expires_at: args[6],
              attempt_count: 0, version: 0, assurance_status: null, failure_code: null
            };
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("UPDATE assurance_jobs")) {
            const row = state.row;
            if (!row || row.version !== args[5] || row.status !== args[6]) return { meta: { changes: 0 } };
            Object.assign(row, { status: args[0], assurance_status: args[1], failure_code: args[2], updated_at: args[3], version: row.version + 1 });
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("INSERT INTO assurance_job_events")) { state.events.push(args); return { meta: { changes: 1 } }; }
          return { meta: { changes: 0 } };
        },
        async first() {
          if (sql.includes("idempotency_key")) return state.row?.idempotency_key === args[0] ? state.row : null;
          if (sql.includes("expires_at")) return state.row?.job_id === args[0] && state.row.expires_at > args[1] ? state.row : null;
          return state.row?.job_id === args[0] ? state.row : null;
        }
      };
    }
  };
}

describe("durable assurance job foundation", () => {
  it("validates job identifiers, fingerprints and retention bounds", () => {
    expect(validateJobInput(input).jobId).toBe(input.jobId);
    expect(() => validateJobInput({ ...input, retentionSeconds: 10 })).toThrow("JOB_RETENTION_OUT_OF_RANGE");
    expect(() => validateJobInput({ ...input, requestFingerprint: "invalid" })).toThrow("REQUEST_FINGERPRINT_INVALID");
  });

  it("creates a queued job and returns status metadata only", async () => {
    const db = fakeD1();
    const created = await createAssuranceJob(db, input, new Date("2026-11-10T00:00:00Z"));
    expect(created.created).toBe(true);
    expect(created.job.status).toBe("queued");
    expect(created.job).not.toHaveProperty("requestJson");
    expect(await getAssuranceJob(db, input.jobId, new Date("2026-11-10T00:01:00Z"))).toMatchObject({ jobId: input.jobId });
  });

  it("hides jobs after expiry", async () => {
    const db = fakeD1();
    await createAssuranceJob(db, input, new Date("2026-11-01T00:00:00Z"));
    expect(await getAssuranceJob(db, input.jobId, new Date("2026-12-01T00:00:00Z"))).toBeNull();
  });

  it("enforces legal transitions and optimistic concurrency", async () => {
    const db = fakeD1();
    await createAssuranceJob(db, input);
    const next = await transitionAssuranceJob(db, {
      jobId: input.jobId, expectedVersion: 0, toStatus: "primary_research_running", eventCode: "PRIMARY_STARTED"
    });
    expect(next.status).toBe("primary_research_running");
    expect(next.version).toBe(1);
    await expect(transitionAssuranceJob(db, {
      jobId: input.jobId, expectedVersion: 0, toStatus: "gemini_review_running", eventCode: "GEMINI_STARTED"
    })).rejects.toThrow("JOB_VERSION_CONFLICT");
  });

  it("rejects skipping mandatory workflow stages", async () => {
    const db = fakeD1();
    await createAssuranceJob(db, input);
    await expect(transitionAssuranceJob(db, {
      jobId: input.jobId, expectedVersion: 0, toStatus: "completed_pending_human_review", eventCode: "SKIP_STAGES"
    })).rejects.toThrow("JOB_TRANSITION_NOT_ALLOWED");
  });
});

describe("queue retry policy", () => {
  it("uses bounded exponential backoff for transient infrastructure errors", () => {
    expect(isRetryableQueueError({ status: 503 })).toBe(true);
    expect(queueRetryDelaySeconds(1)).toBe(15);
    expect(queueRetryDelaySeconds(4)).toBe(120);
    expect(queueRetryDelaySeconds(20)).toBe(900);
  });

  it("does not retry quota, billing, rate-limit or authentication failures", () => {
    for (const error of [
      { code: "quota_exhausted" }, { code: "billing_hard_limit" },
      { status: 401 }, { status: 402 }, { status: 403 }, { status: 429 }
    ]) expect(isRetryableQueueError(error)).toBe(false);
  });

  it("retries transient failures and acknowledges success", async () => {
    const ack = vi.fn(), retry = vi.fn();
    const result = await handleAssuranceQueueMessage(
      { body: { jobId: input.jobId }, attempts: 2, ack, retry },
      vi.fn().mockRejectedValue({ status: 503 })
    );
    expect(result.action).toBe("retry");
    expect(retry).toHaveBeenCalledWith({ delaySeconds: 30 });
    expect(ack).not.toHaveBeenCalled();
  });

  it("acknowledges terminal provider failures without retry", async () => {
    const ack = vi.fn(), retry = vi.fn();
    const result = await handleAssuranceQueueMessage(
      { body: { jobId: input.jobId }, attempts: 1, ack, retry },
      vi.fn().mockRejectedValue({ code: "quota_exhausted" })
    );
    expect(result.action).toBe("ack_terminal_failure");
    expect(ack).toHaveBeenCalledOnce();
    expect(retry).not.toHaveBeenCalled();
  });

  it("acknowledges malformed queue messages without provider execution", async () => {
    const ack = vi.fn(), processJob = vi.fn();
    const result = await handleAssuranceQueueMessage({ body: {}, ack }, processJob);
    expect(result.action).toBe("ack_invalid_message");
    expect(processJob).not.toHaveBeenCalled();
  });
});
