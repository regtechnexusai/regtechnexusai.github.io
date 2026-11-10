const STATUSES = new Set([
  "queued", "primary_research_running", "gemini_review_running",
  "openai_finalisation_running", "openai_self_review_running", "quality_gate",
  "completed_pending_human_review",
  "primary_report_fallback_self_review_unavailable", "failed"
]);

const TRANSITIONS = Object.freeze({
  queued: new Set(["primary_research_running", "failed"]),
  primary_research_running: new Set(["gemini_review_running", "openai_self_review_running", "quality_gate", "failed"]),
  gemini_review_running: new Set(["openai_finalisation_running", "openai_self_review_running", "failed"]),
  openai_finalisation_running: new Set(["quality_gate", "openai_self_review_running", "failed"]),
  openai_self_review_running: new Set(["openai_finalisation_running", "quality_gate", "primary_report_fallback_self_review_unavailable", "failed"]),
  quality_gate: new Set(["completed_pending_human_review", "primary_report_fallback_self_review_unavailable", "failed"]),
  completed_pending_human_review: new Set(),
  primary_report_fallback_self_review_unavailable: new Set(),
  failed: new Set()
});

function project(row) {
  return row ? {
    jobId: row.job_id, status: row.status, assuranceStatus: row.assurance_status,
    failureCode: row.failure_code, attemptCount: row.attempt_count,
    createdAt: row.created_at, updatedAt: row.updated_at,
    expiresAt: row.expires_at, version: row.version
  } : null;
}

export function validateJobInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("JOB_INPUT_INVALID");
  const jobId = String(input.jobId || "").trim();
  const idempotencyKey = String(input.idempotencyKey || "").trim();
  const requestFingerprint = String(input.requestFingerprint || "").trim();
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(jobId)) throw new Error("JOB_ID_INVALID");
  if (!/^[A-Za-z0-9._:-]{16,160}$/.test(idempotencyKey)) throw new Error("IDEMPOTENCY_KEY_INVALID");
  if (!/^[a-f0-9]{64}$/i.test(requestFingerprint)) throw new Error("REQUEST_FINGERPRINT_INVALID");
  if (!Number.isInteger(input.retentionSeconds) || input.retentionSeconds < 60 || input.retentionSeconds > 2592000) {
    throw new Error("JOB_RETENTION_OUT_OF_RANGE");
  }
  return { jobId, idempotencyKey, requestFingerprint, retentionSeconds: input.retentionSeconds };
}

export async function createAssuranceJob(db, input, now = new Date()) {
  if (!db?.prepare) throw new Error("D1_DATABASE_REQUIRED");
  const v = validateJobInput(input);
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + v.retentionSeconds * 1000).toISOString();
  const requestJson = input.request && typeof input.request === "object" && !Array.isArray(input.request)
    ? JSON.stringify(input.request) : null;
  await db.prepare("INSERT INTO assurance_jobs (job_id,idempotency_key,status,request_fingerprint,request_json,created_at,updated_at,expires_at,version) VALUES (?, ?, 'queued', ?, ?, ?, ?, ?, 0) ON CONFLICT(idempotency_key) DO NOTHING")
    .bind(v.jobId, v.idempotencyKey, v.requestFingerprint, requestJson, createdAt, createdAt, expiresAt).run();
  const row = await db.prepare("SELECT * FROM assurance_jobs WHERE idempotency_key = ?").bind(v.idempotencyKey).first();
  if (!row) throw new Error("JOB_CREATE_FAILED");
  if (row.request_fingerprint !== v.requestFingerprint) throw new Error("IDEMPOTENCY_KEY_CONFLICT");
  return { job: project(row), created: row.job_id === v.jobId };
}

export async function getAssuranceJob(db, jobId, now = new Date()) {
  if (!db?.prepare) throw new Error("D1_DATABASE_REQUIRED");
  const row = await db.prepare("SELECT * FROM assurance_jobs WHERE job_id = ? AND expires_at > ?")
    .bind(jobId, now.toISOString()).first();
  return project(row);
}

export async function transitionAssuranceJob(db, input) {
  if (!db?.prepare) throw new Error("D1_DATABASE_REQUIRED");
  if (!STATUSES.has(input.toStatus)) throw new Error("JOB_STATUS_INVALID");
  if (!/^[A-Za-z0-9_:-]{2,80}$/.test(input.eventCode || "")) throw new Error("JOB_EVENT_CODE_INVALID");
  const current = await db.prepare("SELECT * FROM assurance_jobs WHERE job_id = ?").bind(input.jobId).first();
  if (!current) throw new Error("JOB_NOT_FOUND");
  if (!Number.isInteger(input.expectedVersion) || current.version !== input.expectedVersion) throw new Error("JOB_VERSION_CONFLICT");
  if (!TRANSITIONS[current.status]?.has(input.toStatus)) throw new Error("JOB_TRANSITION_NOT_ALLOWED");
  const updatedAt = (input.now || new Date()).toISOString();
  const result = await db.prepare("UPDATE assurance_jobs SET status = ?, assurance_status = ?, failure_code = ?, updated_at = ?, version = version + 1 WHERE job_id = ? AND version = ? AND status = ?")
    .bind(input.toStatus, input.assuranceStatus || null, input.failureCode || null, updatedAt, input.jobId, input.expectedVersion, current.status).run();
  if (result?.meta?.changes !== 1) throw new Error("JOB_VERSION_CONFLICT");
  await db.prepare("INSERT INTO assurance_job_events (job_id,from_status,to_status,event_code,created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(input.jobId, current.status, input.toStatus, input.eventCode, updatedAt).run();
  return project(await db.prepare("SELECT * FROM assurance_jobs WHERE job_id = ?").bind(input.jobId).first());
}

export function isRetryableQueueError(error) {
  const code = String(error?.code || "").toLowerCase();
  const status = Number(error?.status || 0);
  if (["quota_exhausted", "billing_hard_limit", "invalid_api_key", "authentication_failed", "permission_denied"].includes(code)) return false;
  if ([401, 402, 403, 429].includes(status)) return false;
  return status === 408 || status === 425 || status >= 500 || code === "transient_network_error";
}

export function queueRetryDelaySeconds(attempts, baseSeconds = 15, maxSeconds = 900) {
  const attempt = Math.max(1, Math.min(10, Number(attempts) || 1));
  return Math.min(maxSeconds, baseSeconds * (2 ** (attempt - 1)));
}

export async function handleAssuranceQueueMessage(message, processJob) {
  const jobId = message?.body?.jobId;
  if (typeof jobId !== "string" || !jobId) {
    message?.ack?.();
    return { action: "ack_invalid_message" };
  }
  try {
    await processJob(jobId);
    message.ack();
    return { action: "ack_processed" };
  } catch (error) {
    if (isRetryableQueueError(error) && typeof message.retry === "function") {
      const delaySeconds = queueRetryDelaySeconds(message.attempts);
      message.retry({ delaySeconds });
      return { action: "retry", delaySeconds };
    }
    message.ack();
    return { action: "ack_terminal_failure", code: String(error?.code || "NON_RETRYABLE_FAILURE") };
  }
}
