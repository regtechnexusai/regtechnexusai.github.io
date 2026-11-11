import { describe, expect, it, vi } from "vitest";
import { createPhaseBQueueConsumer } from "../src/phaseb-queue-consumer.js";

function dbWithQueuedJob() {
  return {
    prepare: () => ({ bind: () => ({ first: async () => ({
      job_id: "job_0123456789abcdef", tenant_id: "tenant_alpha_001",
      status: "queued", version: 0
    }) }) }),
    batch: async () => []
  };
}
function message(body={jobId:"job_0123456789abcdef"}, attempts=1) {
  return { body, attempts, ack:vi.fn(), retry:vi.fn() };
}

describe("Phase B Cloudflare Queue consumer", () => {
  it("processes a message and acknowledges only after processor success", async () => {
    const processJob=vi.fn().mockResolvedValue({status:"completed_pending_human_review"});
    const consumer=createPhaseBQueueConsumer({processJob});
    const m=message();
    await consumer({messages:[m]}, {ASSURANCE_DB:dbWithQueuedJob(),ASSURANCE_DLQ:{send:vi.fn()}});
    expect(processJob).toHaveBeenCalledWith(expect.anything(),m.body.jobId,{tenantId:"tenant_alpha_001"},expect.anything());
    expect(m.ack).toHaveBeenCalledOnce();
    expect(m.retry).not.toHaveBeenCalled();
  });

  it("delegates retryable failures to Cloudflare retry without acknowledging", async () => {
    const processJob=vi.fn().mockRejectedValue(Object.assign(new Error("temporary"),{status:503}));
    const consumer=createPhaseBQueueConsumer({processJob});
    const m=message();
    await consumer({messages:[m]}, {ASSURANCE_DB:dbWithQueuedJob(),ASSURANCE_DLQ:{send:vi.fn()}});
    expect(m.retry).toHaveBeenCalledOnce();
    expect(m.ack).not.toHaveBeenCalled();
  });

  it("fails closed if the durable DLQ binding is missing", async () => {
    const consumer=createPhaseBQueueConsumer({processJob:vi.fn()});
    await expect(consumer({messages:[message()]},{ASSURANCE_DB:dbWithQueuedJob()}))
      .rejects.toThrow("PHASEB_QUEUE_BINDINGS_REQUIRED");
  });
});
