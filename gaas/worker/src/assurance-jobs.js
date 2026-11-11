const STATUSES = new Set(["queued","primary_research_running","gemini_review_running","openai_finalisation_running","openai_self_review_running","quality_gate","completed_pending_human_review","primary_report_fallback_self_review_unavailable","failed"]);
const TRANSITIONS = Object.freeze({
  queued:new Set(["primary_research_running","failed"]),
  primary_research_running:new Set(["gemini_review_running","openai_self_review_running","quality_gate","failed"]),
  gemini_review_running:new Set(["openai_finalisation_running","openai_self_review_running","failed"]),
  openai_finalisation_running:new Set(["quality_gate","openai_self_review_running","failed"]),
  openai_self_review_running:new Set(["openai_finalisation_running","quality_gate","primary_report_fallback_self_review_unavailable","failed"]),
  quality_gate:new Set(["completed_pending_human_review","primary_report_fallback_self_review_unavailable","failed"]),
  completed_pending_human_review:new Set(),primary_report_fallback_self_review_unavailable:new Set(),failed:new Set()
});
const REQUEST_FIELDS=new Set(["jurisdiction","topic","question","asOfDate","sourceScope"]);
const MAX_TEXT={jurisdiction:80,topic:160,question:1800,asOfDate:10,sourceScope:300};
const SENSITIVE_PATTERNS=[/\bSAR\b|\bSTR\b|suspicious activity report|suspicious transaction report/i,/\b(account|card|iban|swift|routing)\s*(number|no\.?|#)\s*[:=]?\s*[A-Z0-9-]{6,}/i,/\b(passport|national id|nid|ssn|tax id)\s*(number|no\.?|#)\s*[:=]?\s*[A-Z0-9-]{5,}/i,/\b\d{8,20}\b/,/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,/(?:\+?\d[\d .()-]{8,}\d)/];
function stableStringify(value){if(Array.isArray(value))return `[${value.map(stableStringify).join(",")}]`;if(value&&typeof value==="object")return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;return JSON.stringify(value);}
async function sha256(value){const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");}
function project(row){return row?{jobId:row.job_id,status:row.status,assuranceStatus:row.assurance_status,failureCode:row.failure_code,attemptCount:row.attempt_count,createdAt:row.created_at,updatedAt:row.updated_at,expiresAt:row.expires_at,version:row.version}:null;}
function validateTenantId(value){if(typeof value!=="string"||!/^[A-Za-z0-9_-]{8,100}$/.test(value))throw new Error("AUTHENTICATED_TENANT_REQUIRED");return value;}
export function validateJobRequest(request){
  if(!request||typeof request!=="object"||Array.isArray(request))throw new Error("JOB_REQUEST_INVALID");
  const keys=Object.keys(request);if(!keys.length||keys.some(k=>!REQUEST_FIELDS.has(k)))throw new Error("JOB_REQUEST_FIELD_NOT_ALLOWED");
  const clean={};for(const key of keys){const value=request[key];if(typeof value!=="string"||!value.trim()||value.length>MAX_TEXT[key])throw new Error("JOB_REQUEST_FIELD_INVALID");const text=value.trim();if(SENSITIVE_PATTERNS.some(p=>p.test(text)))throw new Error("JOB_REQUEST_SENSITIVE_DATA_BLOCKED");clean[key]=text;}
  if(clean.jurisdiction&&!/^[A-Z]{2,3}(?:-[A-Z0-9]{1,4})?$/.test(clean.jurisdiction))throw new Error("JOB_JURISDICTION_INVALID");
  if(clean.asOfDate&&!/^\d{4}-\d{2}-\d{2}$/.test(clean.asOfDate))throw new Error("JOB_AS_OF_DATE_INVALID");
  const canonical=stableStringify(clean);if(new TextEncoder().encode(canonical).byteLength>4096)throw new Error("JOB_REQUEST_TOO_LARGE");return{clean,canonical};
}
export function validateJobInput(input,authContext){
  if(!input||typeof input!=="object"||Array.isArray(input))throw new Error("JOB_INPUT_INVALID");
  const tenantId=validateTenantId(authContext?.tenantId);const idempotencyKey=String(input.idempotencyKey||"").trim();
  if(!/^[A-Za-z0-9._:-]{16,160}$/.test(idempotencyKey))throw new Error("IDEMPOTENCY_KEY_INVALID");
  if(!Number.isInteger(input.retentionSeconds)||input.retentionSeconds<60||input.retentionSeconds>2592000)throw new Error("JOB_RETENTION_OUT_OF_RANGE");
  return{tenantId,idempotencyKey,retentionSeconds:input.retentionSeconds,request:validateJobRequest(input.request)};
}
export async function createAssuranceJob(db,input,authContext,now=new Date()){
  if(!db?.prepare||!db?.batch)throw new Error("D1_DATABASE_REQUIRED");const v=validateJobInput(input,authContext);
  const fingerprint=await sha256(v.request.canonical),createdAt=now.toISOString(),expiresAt=new Date(now.getTime()+v.retentionSeconds*1000).toISOString();
  const jobId=`job_${crypto.randomUUID().replaceAll("-","")}`;
  const results=await db.batch([
    db.prepare("INSERT INTO assurance_jobs (job_id,tenant_id,idempotency_key,status,request_fingerprint,request_json,created_at,updated_at,expires_at,version) VALUES (?, ?, ?, 'queued', ?, ?, ?, ?, ?, 0) ON CONFLICT(tenant_id,idempotency_key) DO NOTHING").bind(jobId,v.tenantId,v.idempotencyKey,fingerprint,JSON.stringify(v.request.clean),createdAt,createdAt,expiresAt),
    db.prepare("INSERT INTO assurance_job_events (job_id,tenant_id,from_status,to_status,event_code,created_at) SELECT ?, ?, NULL, 'queued', 'JOB_CREATED', ? WHERE EXISTS (SELECT 1 FROM assurance_jobs WHERE job_id=? AND tenant_id=? AND status='queued' AND version=0) AND NOT EXISTS (SELECT 1 FROM assurance_job_events WHERE job_id=? AND event_code='JOB_CREATED')").bind(jobId,v.tenantId,createdAt,jobId,v.tenantId,jobId)
  ]);
  const row=await db.prepare("SELECT * FROM assurance_jobs WHERE tenant_id=? AND idempotency_key=?").bind(v.tenantId,v.idempotencyKey).first();
  if(!row)throw new Error("JOB_CREATE_FAILED");if(row.request_fingerprint!==fingerprint)throw new Error("IDEMPOTENCY_KEY_CONFLICT");
  return{job:project(row),created:Number(results?.[0]?.meta?.changes||0)===1};
}
export async function getAssuranceJob(db,authContext,jobId,now=new Date()){
  const tenantId=validateTenantId(authContext?.tenantId);const row=await db.prepare("SELECT * FROM assurance_jobs WHERE tenant_id=? AND job_id=? AND expires_at>?").bind(tenantId,jobId,now.toISOString()).first();return project(row);
}
export async function transitionAssuranceJob(db,authContext,input){
  const tenantId=validateTenantId(authContext?.tenantId);if(!STATUSES.has(input.toStatus))throw new Error("JOB_STATUS_INVALID");
  if(!/^[A-Za-z0-9_:-]{2,80}$/.test(input.eventCode||""))throw new Error("JOB_EVENT_CODE_INVALID");
  const current=await db.prepare("SELECT * FROM assurance_jobs WHERE tenant_id=? AND job_id=?").bind(tenantId,input.jobId).first();
  if(!current)throw new Error("JOB_NOT_FOUND");if(!Number.isInteger(input.expectedVersion)||current.version!==input.expectedVersion)throw new Error("JOB_VERSION_CONFLICT");
  if(!TRANSITIONS[current.status]?.has(input.toStatus))throw new Error("JOB_TRANSITION_NOT_ALLOWED");const updatedAt=(input.now||new Date()).toISOString();
  const results=await db.batch([
    db.prepare("UPDATE assurance_jobs SET status=?,assurance_status=?,failure_code=?,updated_at=?,version=version+1 WHERE tenant_id=? AND job_id=? AND version=? AND status=?").bind(input.toStatus,input.assuranceStatus||null,input.failureCode||null,updatedAt,tenantId,input.jobId,input.expectedVersion,current.status),
    db.prepare("INSERT INTO assurance_job_events (job_id,tenant_id,from_status,to_status,event_code,created_at,job_version) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM assurance_jobs WHERE tenant_id=? AND job_id=? AND version=? AND status=?)").bind(input.jobId,tenantId,current.status,input.toStatus,input.eventCode,updatedAt,input.expectedVersion+1,tenantId,input.jobId,input.expectedVersion+1,input.toStatus)
  ]);
  if(Number(results?.[0]?.meta?.changes||0)!==1||Number(results?.[1]?.meta?.changes||0)!==1)throw new Error("JOB_VERSION_CONFLICT");
  return project(await db.prepare("SELECT * FROM assurance_jobs WHERE tenant_id=? AND job_id=?").bind(tenantId,input.jobId).first());
}
export function classifyQueueError(error){
  const code=String(error?.code||"").toLowerCase(),status=Number(error?.status||0);
  if(["quota_exhausted","billing_hard_limit","invalid_api_key","authentication_failed","permission_denied","provider_quota_exhausted"].includes(code))return{retryable:false,code:"PROVIDER_TERMINAL_LIMIT"};
  if([401,402,403].includes(status))return{retryable:false,code:"PROVIDER_AUTH_OR_BILLING_FAILURE"};
  if(status===429&&error?.quotaExhausted!==true&&Number(error?.retryAfterSeconds)>0)return{retryable:true,code:"PROVIDER_RATE_LIMIT_RETRY"};
  if(status===429)return{retryable:false,code:"PROVIDER_RATE_LIMIT_UNCLASSIFIED"};
  return{retryable:status===408||status===425||status>=500||code==="transient_network_error",code:"TRANSIENT_OR_UNKNOWN_FAILURE"};
}
export function queueRetryDelaySeconds(attempts,retryAfterSeconds,random=Math.random){
  const attempt=Math.max(1,Math.min(8,Number(attempts)||1)),exponential=Math.min(900,15*(2**(attempt-1))),jittered=Math.max(1,Math.floor(exponential*(0.75+random()*0.5))),retryAfter=Number(retryAfterSeconds);
  return Number.isFinite(retryAfter)&&retryAfter>0?Math.min(900,Math.max(jittered,Math.ceil(retryAfter))):jittered;
}
export async function persistTerminalQueueFailure(db,authContext,input){
  const current=await getAssuranceJob(db,authContext,input.jobId,new Date(0));if(!current)throw new Error("JOB_NOT_FOUND");if(current.status==="failed")return current;
  return transitionAssuranceJob(db,authContext,{jobId:input.jobId,expectedVersion:current.version,toStatus:"failed",eventCode:"QUEUE_TERMINAL_FAILURE",failureCode:input.failureCode||"NON_RETRYABLE_PROVIDER_FAILURE",now:input.now});
}
export async function handleAssuranceQueueMessage(message,processJob,persistTerminal,deadLetterQueue,alertQueue){
  const jobId=message?.body?.jobId;
  if(typeof jobId!=="string"||!jobId){if(deadLetterQueue?.send)await deadLetterQueue.send({type:"INVALID_MESSAGE",receivedAt:new Date().toISOString()});message?.ack?.();return{action:"ack_invalid_message"};}
  try{await processJob(jobId);message.ack();return{action:"ack_processed"};}
  catch(error){
    const classification=classifyQueueError(error);
    if(classification.retryable&&Number(message.attempts||1)<5&&typeof message.retry==="function"){const delaySeconds=queueRetryDelaySeconds(message.attempts,error?.retryAfterSeconds);message.retry({delaySeconds});return{action:"retry",delaySeconds,code:classification.code};}
    const terminal=await persistTerminal(jobId,classification.code),deadLetter={jobId,failureCode:classification.code,status:terminal.status,failedAt:terminal.updatedAt};
    if(!deadLetterQueue?.send)throw new Error("DEAD_LETTER_QUEUE_REQUIRED");await deadLetterQueue.send(deadLetter);
    if(alertQueue?.send)await alertQueue.send({type:"GAAS_JOB_TERMINAL_FAILURE",jobId,failureCode:classification.code});message.ack();return{action:"ack_terminal_persisted",code:classification.code};
  }
}
export async function deleteExpiredAssuranceJobs(db,now=new Date(),limit=100){
  const boundedLimit=Math.max(1,Math.min(1000,Number(limit)||100));const result=await db.prepare("DELETE FROM assurance_jobs WHERE job_id IN (SELECT job_id FROM assurance_jobs WHERE expires_at<=? ORDER BY expires_at LIMIT ?)").bind(now.toISOString(),boundedLimit).run();return{deleted:Number(result?.meta?.changes||0)};
}
