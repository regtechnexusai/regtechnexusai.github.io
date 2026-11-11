import {describe,it,expect,vi} from "vitest";
import {validateRequest,fingerprintRequest,isRetryableQueueError,queueRetryDelaySeconds,handleAssuranceQueueMessage,transitionAssuranceJob} from "../src/assurance-jobs.js";
const req={jurisdiction:"GB",topic:"AML/CFT regulatory updates",period:"2026-Q4"};
function transitionDb({current,results=[{meta:{changes:1}},{meta:{changes:1}}]}={}){
  const prepared=[];
  const db={
    prepare:vi.fn((sql)=>({sql,values:[],bind(...values){this.values=values;prepared.push(this);return this;},first:vi.fn(async()=>db.didBatch?{...current,status:"primary_research_running",version:current.version+1}:current)})),
    batch:vi.fn(async statements=>{db.batchStatements=statements;db.didBatch=true;return results;})
  };
  return {db,prepared};
}
describe("Phase B assurance hardening",()=>{
it("allowlists request fields and rejects obvious personal data",()=>{expect(validateRequest(req).jurisdiction).toBe("GB");expect(()=>validateRequest({...req,customerName:"x"})).toThrow("REQUEST_FIELD_NOT_ALLOWED");expect(()=>validateRequest({jurisdiction:"GB",topic:"alice@example.com account review"})).toThrow("REQUEST_POSSIBLE_PERSONAL_DATA");});
it("fingerprints canonical request content",async()=>{expect(await fingerprintRequest({jurisdiction:"GB",topic:"AML/CFT"})).toBe(await fingerprintRequest({topic:"AML/CFT",jurisdiction:"GB"}));});
it("retries transient 429 only with explicit Retry-After",()=>{expect(isRetryableQueueError({status:503})).toBe(true);expect(isRetryableQueueError({status:429,code:"rate_limited",retryAfterSeconds:30})).toBe(true);expect(isRetryableQueueError({status:429,code:"quota_exhausted",retryAfterSeconds:30})).toBe(false);expect(isRetryableQueueError({code:"billing_hard_limit"})).toBe(false);expect(queueRetryDelaySeconds(2)).toBeGreaterThanOrEqual(1);});
it("persists and dead-letters before acknowledging terminal failure",async()=>{const ack=vi.fn(),persist=vi.fn(),dlq=vi.fn();const out=await handleAssuranceQueueMessage({body:{jobId:"job-1"},attempts:1,ack},{processJob:vi.fn().mockRejectedValue({code:"quota_exhausted"}),persistTerminalFailure:persist,sendToDeadLetter:dlq});expect(out.action).toBe("ack_terminal_failure");expect(persist).toHaveBeenCalledOnce();expect(dlq).toHaveBeenCalledOnce();expect(ack).toHaveBeenCalledOnce();});
it("does not acknowledge if terminal persistence handlers are missing",async()=>{const ack=vi.fn();await expect(handleAssuranceQueueMessage({body:{jobId:"job-1"},attempts:1,ack},{processJob:vi.fn().mockRejectedValue({status:401})})).rejects.toThrow("TERMINAL_FAILURE_HANDLERS_REQUIRED");expect(ack).not.toHaveBeenCalled();});
it("submits tenant-scoped optimistic update and versioned audit insert in one D1 batch",async()=>{
 const current={job_id:"job-1",tenant_id:"tenant_123456",status:"queued",version:0};
 const {db}=transitionDb({current});
 const out=await transitionAssuranceJob(db,{tenantId:"tenant_123456",jobId:"job-1",expectedVersion:0,toStatus:"primary_research_running",eventCode:"PRIMARY_STARTED",now:new Date("2026-11-11T15:00:00.000Z")});
 expect(db.batch).toHaveBeenCalledOnce();
 expect(db.batchStatements).toHaveLength(2);
 expect(db.batchStatements[0].sql).toContain("WHERE tenant_id=? AND job_id=? AND version=? AND status=?");
 expect(db.batchStatements[0].values).toEqual(["primary_research_running",null,null,"2026-11-11T15:00:00.000Z","tenant_123456","job-1",0,"queued"]);
 expect(db.batchStatements[1].sql).toContain("job_version");
 expect(db.batchStatements[1].values).toEqual(["queued","PRIMARY_STARTED","2026-11-11T15:00:00.000Z","tenant_123456","job-1",1,"primary_research_running"]);
 expect(out.version).toBe(1);
});
it("rejects stale versions before attempting a D1 batch",async()=>{
 const {db}=transitionDb({current:{job_id:"job-1",tenant_id:"tenant_123456",status:"queued",version:2}});
 await expect(transitionAssuranceJob(db,{tenantId:"tenant_123456",jobId:"job-1",expectedVersion:1,toStatus:"primary_research_running",eventCode:"PRIMARY_STARTED"})).rejects.toThrow("JOB_VERSION_CONFLICT");
 expect(db.batch).not.toHaveBeenCalled();
});
it("fails closed when D1 batch reports an update or event insert count other than one",async()=>{
 const {db}=transitionDb({current:{job_id:"job-1",tenant_id:"tenant_123456",status:"queued",version:0},results:[{meta:{changes:0}},{meta:{changes:0}}]});
 await expect(transitionAssuranceJob(db,{tenantId:"tenant_123456",jobId:"job-1",expectedVersion:0,toStatus:"primary_research_running",eventCode:"PRIMARY_STARTED"})).rejects.toThrow("JOB_VERSION_CONFLICT_OR_EVENT_WRITE_FAILED");
});
});
