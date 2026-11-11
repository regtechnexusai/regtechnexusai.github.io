import {
  handleAssuranceQueueMessage,
  transitionAssuranceJob,
  persistTerminalQueueFailure
} from "./assurance-jobs.js";

async function loadJob(db, jobId) {
  return db.prepare("SELECT job_id, tenant_id, status, version FROM assurance_jobs WHERE job_id=?")
    .bind(jobId).first();
}

async function processSyntheticAcceptanceJob(db, jobId) {
  const row = await loadJob(db, jobId);
  if (!row) throw Object.assign(new Error("JOB_NOT_FOUND"), { code: "JOB_NOT_FOUND" });
  const auth = { tenantId: row.tenant_id };
  if (row.status === "completed_pending_human_review") return row;
  if (row.status !== "queued") {
    // A duplicate delivery after a committed transition must not replay work.
    throw Object.assign(new Error("JOB_ALREADY_IN_PROGRESS"), { code: "JOB_ALREADY_IN_PROGRESS", status: 409 });
  }
  let current = await transitionAssuranceJob(db, auth, {
    jobId, expectedVersion: row.version, toStatus: "primary_research_running",
    eventCode: "SYNTHETIC_ACCEPTANCE_STARTED"
  });
  current = await transitionAssuranceJob(db, auth, {
    jobId, expectedVersion: current.version, toStatus: "quality_gate",
    eventCode: "SYNTHETIC_ACCEPTANCE_QUALITY_GATE"
  });
  return transitionAssuranceJob(db, auth, {
    jobId, expectedVersion: current.version, toStatus: "completed_pending_human_review",
    eventCode: "SYNTHETIC_ACCEPTANCE_COMPLETED",
    assuranceStatus: "synthetic_test_only"
  });
}

export function createPhaseBQueueConsumer({ processJob }) {
  return async function queue(batch, env) {
    if (!env.ASSURANCE_DB?.prepare || !env.ASSURANCE_DB?.batch ||
        !env.ASSURANCE_DLQ?.send) {
      throw new Error("PHASEB_QUEUE_BINDINGS_REQUIRED");
    }
    for (const message of batch.messages || []) {
      const jobId = message?.body?.jobId;
      let auth = null;
      const persistTerminal = async (id, failureCode) => {
        const row = await loadJob(env.ASSURANCE_DB, id);
        if (!row) throw new Error("JOB_NOT_FOUND");
        auth = { tenantId: row.tenant_id };
        return persistTerminalQueueFailure(env.ASSURANCE_DB, auth, {
          jobId: id, failureCode
        });
      };
      await handleAssuranceQueueMessage(
        message,
        async id => {
          const row = await loadJob(env.ASSURANCE_DB, id);
          if (!row) throw Object.assign(new Error("JOB_NOT_FOUND"), { code: "JOB_NOT_FOUND" });
          auth = { tenantId: row.tenant_id };
          return processJob(env.ASSURANCE_DB, id, auth, env);
        },
        persistTerminal,
        env.ASSURANCE_DLQ,
        env.ASSURANCE_ALERT_QUEUE
      );
    }
  };
}

async function unavailableProcessor() {
  throw Object.assign(new Error("PHASEB_RESEARCH_PROCESSOR_NOT_CONFIGURED"), {
    code: "PHASEB_RESEARCH_PROCESSOR_NOT_CONFIGURED"
  });
}

export const phaseBQueue = createPhaseBQueueConsumer({
  processJob: async (db, jobId, auth, env) => {
    if (env.PHASEB_QUEUE_TEST_MODE === "true") {
      return processSyntheticAcceptanceJob(db, jobId);
    }
    return unavailableProcessor();
  }
});
