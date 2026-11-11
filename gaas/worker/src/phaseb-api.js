import { authenticateCloudflareAccess } from "./cloudflare-access-auth.js";
import { createAssuranceJob, getAssuranceJob } from "./assurance-jobs.js";

const HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const MAX_BODY = 8 * 1024;
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:HEADERS});}
function fail(error){
  const status=Number(error?.status)||({
    ACCESS_CONFIGURATION_MISSING:503,
    TENANT_MEMBERSHIP_DATABASE_REQUIRED:503,
    AUTHENTICATED_TENANT_REQUIRED:401,
    JOB_REQUEST_SENSITIVE_DATA_BLOCKED:422,
    JOB_REQUEST_FIELD_NOT_ALLOWED:400,
    JOB_REQUEST_INVALID:400,
    JOB_INPUT_INVALID:400,
    JOB_REQUEST_FIELD_INVALID:400,
    JOB_JURISDICTION_INVALID:400,
    JOB_AS_OF_DATE_INVALID:400,
    JOB_REQUEST_TOO_LARGE:413,
    IDEMPOTENCY_KEY_INVALID:400,
    JOB_RETENTION_OUT_OF_RANGE:400,
    IDEMPOTENCY_KEY_CONFLICT:409,
    JOB_NOT_FOUND:404
  }[error?.message]||400);
  return json({error: error?.code||error?.message||"PHASEB_REQUEST_FAILED"},status);
}
async function authenticate(request,env){
  const authorization=request.headers.get("Authorization")||"";
  if(!/^Bearer\s+\S+/i.test(authorization)){
    return authenticateCloudflareAccess(request,env,null);
  }
  if(!env.ASSURANCE_DB?.prepare||!env.ASSURANCE_DB?.batch)throw Object.assign(new Error("TENANT_MEMBERSHIP_DATABASE_REQUIRED"),{status:503});
  return authenticateCloudflareAccess(request,env,env.ASSURANCE_DB);
}
export async function handlePhaseBApi(request,env,url=new URL(request.url)){
  if(!url.pathname.startsWith("/api/jobs"))return null;
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:HEADERS});
  try{
    const auth=await authenticate(request,env);
    if(url.pathname==="/api/jobs"&&request.method==="POST"){
      if(!["tenant_admin","analyst"].includes(auth.role))return json({error:"ROLE_FORBIDDEN"},403);
      if(!env.ASSURANCE_QUEUE?.send)return json({error:"ASSURANCE_QUEUE_NOT_CONFIGURED"},503);
      const length=Number(request.headers.get("content-length")||0);
      if(length>MAX_BODY)return json({error:"REQUEST_TOO_LARGE"},413);
      const raw=await request.text();
      if(new TextEncoder().encode(raw).byteLength>MAX_BODY)return json({error:"REQUEST_TOO_LARGE"},413);
      let body;try{body=JSON.parse(raw);}catch{return json({error:"INVALID_JSON"},400);}
      if(!body||typeof body!=="object"||Array.isArray(body))return json({error:"INVALID_REQUEST"},400);
      const result=await createAssuranceJob(env.ASSURANCE_DB,{
        idempotencyKey:request.headers.get("Idempotency-Key")||body.idempotencyKey,
        retentionSeconds:body.retentionSeconds,
        request:body.request
      },auth);
      // Job IDs are globally random and the consumer must re-read tenant/job state from D1.
      // Re-enqueue queued idempotent submissions so a prior Queue-send outage can be recovered.
      if(result.job.status==="queued")await env.ASSURANCE_QUEUE.send({jobId:result.job.jobId});
      return json({job:result.job,created:result.created,queue:"accepted"},result.created?202:200);
    }
    const match=url.pathname.match(/^\/api\/jobs\/(job_[A-Za-z0-9]+)$/);
    if(match&&request.method==="GET"){
      const job=await getAssuranceJob(env.ASSURANCE_DB,auth,match[1]);
      return job?json({job}):json({error:"JOB_NOT_FOUND"},404);
    }
    return json({error:"NOT_FOUND"},404);
  }catch(error){return fail(error);}
}
