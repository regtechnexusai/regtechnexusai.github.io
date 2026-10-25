(function(){
"use strict";
const $=id=>document.getElementById(id);
const core=window.DBSRFCore, evidenceApi=window.DBSRFEvidence, storage=window.DBSRFStorage;
if(!core||!evidenceApi||!storage){$("dbsr-message").textContent="A required local module could not load. Refresh the page or report the issue.";return;}
let answers={}, evidenceArtifacts=[];
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const confidenceOptions=["High","Moderate","Low","Unverified"];
const pillars=core.PILLARS;
function renderQuestions(){
 $("dbsr-pillars").innerHTML=pillars.map(p=>{
  const qs=core.QUESTIONS.filter(q=>q.pillarId===p.id);
  return '<section class="dbsr-pillar" aria-labelledby="pillar-'+p.id+'"><h3 id="pillar-'+p.id+'">'+escapeHtml(p.id+' · '+p.name)+'</h3><div class="dbsr-pillar-meta" id="meta-'+p.id+'">Not assessed</div>'+
   qs.map(q=>'<article class="dbsr-question" data-qid="'+q.id+'"><div class="dbsr-qhead"><span class="dbsr-qid">'+q.id+'</span><div class="dbsr-qprompt">'+escapeHtml(q.prompt)+(q.criticalGate?' <span title="Critical gate">*</span>':'')+'</div></div>'+
   '<div class="dbsr-fields"><div class="dbsr-field"><label for="status-'+q.id+'">Assessment status</label><select id="status-'+q.id+'" data-field="status" data-qid="'+q.id+'"><option value="">Choose…</option><option value="assessed">Assessed</option><option value="na">Not applicable (N/A)</option></select></div>'+
   '<div class="dbsr-field" data-assessed="'+q.id+'"><label for="score-'+q.id+'">Maturity score (0–4)</label><select id="score-'+q.id+'" data-field="score" data-qid="'+q.id+'"><option value="">Choose score…</option><option value="0">0 — Absent</option><option value="1">1 — Ad hoc</option><option value="2">2 — Designed</option><option value="3">3 — Implemented</option><option value="4">4 — Tested and sustained</option></select></div>'+
   '<div class="dbsr-field" data-assessed="'+q.id+'"><label for="confidence-'+q.id+'">Evidence confidence</label><select id="confidence-'+q.id+'" data-field="evidenceConfidence" data-qid="'+q.id+'"><option value="">Choose…</option>'+confidenceOptions.map(x=>'<option>'+x+'</option>').join("")+'</select></div>'+
   '<div class="dbsr-field" data-assessed="'+q.id+'"><label for="evid-'+q.id+'">Evidence artifact IDs (comma-separated)</label><input id="evid-'+q.id+'" data-field="evidenceIds" data-qid="'+q.id+'" placeholder="e.g. EV-001, EV-002"></div>'+
   '<div class="dbsr-field dbsr-hidden" data-na="'+q.id+'"><label for="just-'+q.id+'">N/A justification</label><textarea id="just-'+q.id+'" data-field="justification" data-qid="'+q.id+'" placeholder="At least 20 characters: explain why this question is not applicable to the assessed scope."></textarea></div>'+
   '<div class="dbsr-field dbsr-hidden" data-na="'+q.id+'"><label for="approver-'+q.id+'">Approver identifier</label><input id="approver-'+q.id+'" data-field="approvedBy" data-qid="'+q.id+'" placeholder="Reviewer or approver ID"></div></div>'+
   '<div class="dbsr-checks dbsr-hidden" data-na="'+q.id+'"><label><input type="checkbox" data-field="applicabilityVerified" data-qid="'+q.id+'"> Applicability independently verified</label></div>'+
   (q.criticalGate?'<div class="dbsr-checks dbsr-hidden" data-assessed="'+q.id+'"><label><input type="checkbox" data-field="criticalFindingConfirmed" data-qid="'+q.id+'"> Reviewer confirms a critical finding</label><label><input type="checkbox" data-field="reviewerVerified" data-qid="'+q.id+'"> Reviewer verification completed</label></div>':'')+
   '</article>').join("")+'</section>';
 }).join("");
}
function readQuestion(qid){
 const status=$("status-"+qid).value;
 if(!status){delete answers[qid];return;}
 if(status==="na"){
  answers[qid]={status:"na",justification:$("just-"+qid).value,approvedBy:$("approver-"+qid).value,applicabilityVerified:document.querySelector('[data-field="applicabilityVerified"][data-qid="'+qid+'"]').checked};
 }else{
  const score=$("score-"+qid).value, confidence=$("confidence-"+qid).value;
  const ev=$("evid-"+qid).value.split(",").map(s=>s.trim()).filter(Boolean);
  const a={status:"assessed",evidenceIds:ev,criticalFindingConfirmed:false,reviewerVerified:false};
  if(score!=="")a.score=Number(score);
  if(confidence!=="")a.evidenceConfidence=confidence;
  const critical=document.querySelector('[data-field="criticalFindingConfirmed"][data-qid="'+qid+'"]');
  const verified=document.querySelector('[data-field="reviewerVerified"][data-qid="'+qid+'"]');
  if(critical)a.criticalFindingConfirmed=critical.checked;
  if(verified)a.reviewerVerified=verified.checked;
  answers[qid]=a;
 }
}
function syncFromInputs(){
 core.QUESTIONS.forEach(q=>readQuestion(q.id));
 try{evidenceArtifacts=JSON.parse($("dbsr-evidence-json").value||"[]");}catch(_){evidenceArtifacts=null;}
 updateResults();
}
function setVisibility(qid){
 const status=$("status-"+qid).value;
 document.querySelectorAll('[data-assessed="'+qid+'"]').forEach(el=>el.classList.toggle("dbsr-hidden",status!=="assessed"));
 document.querySelectorAll('[data-na="'+qid+'"]').forEach(el=>el.classList.toggle("dbsr-hidden",status!=="na"));
}
function renderQuestionValues(){
 core.QUESTIONS.forEach(q=>{
  const a=answers[q.id]; if(!a)return;
  $("status-"+q.id).value=a.status;
  if(a.status==="assessed"){
   if(a.score!==undefined)$("score-"+q.id).value=String(a.score);
   if(a.evidenceConfidence)$("confidence-"+q.id).value=a.evidenceConfidence;
   $("evid-"+q.id).value=(a.evidenceIds||[]).join(", ");
   const c=document.querySelector('[data-field="criticalFindingConfirmed"][data-qid="'+q.id+'"]');
   const v=document.querySelector('[data-field="reviewerVerified"][data-qid="'+q.id+'"]');
   if(c)c.checked=!!a.criticalFindingConfirmed;if(v)v.checked=!!a.reviewerVerified;
  }else{
   $("just-"+q.id).value=a.justification||"";$("approver-"+q.id).value=a.approvedBy||"";
   const n=document.querySelector('[data-field="applicabilityVerified"][data-qid="'+q.id+'"]');if(n)n.checked=!!a.applicabilityVerified;
  }
  setVisibility(q.id);
 });
}
function renderValidationErrors(errors){
 const host=$("dbsr-message");
 document.querySelectorAll(".dbsr-field-error").forEach(el=>el.remove());
 document.querySelectorAll(".dbsr-field input,.dbsr-field select,.dbsr-field textarea").forEach(el=>el.removeAttribute("aria-invalid"));
 if(!Array.isArray(errors)||!errors.length){host.innerHTML="Assessment recalculated.";host.className="dbsr-message";return;}
 const parsed=errors.map(err=>{const raw=String(err);const match=raw.match(/\b([A-Z]{3}-\d{2})\b/);return {raw,qid:match?match[1]:null};});
 parsed.forEach((item,i)=>{
  if(!item.qid)return;
  const card=document.querySelector('.dbsr-question[data-qid="'+item.qid+'"]');if(!card)return;
  const fieldMatch=item.raw.match(/(score|confidence|evidence|reviewer|approved|justification|status|N\/A|applicability)/i);
  let field=null;
  if(fieldMatch){const word=fieldMatch[1].toLowerCase();const key=word.includes("score")?"score":word.includes("confidence")?"evidenceConfidence":word.includes("evidence")?"evidenceIds":word.includes("reviewer")?"reviewerVerified":word.includes("approved")?"approvedBy":word.includes("justification")||word==="n/a"?"justification":word.includes("applicability")?"applicabilityVerified":"status";field=card.querySelector('[data-field="'+key+'"]');}
  field=field||card.querySelector('[data-field="status"]');
  if(field){field.setAttribute("aria-invalid","true");const wrap=field.closest(".dbsr-field")||field.parentElement;const msg=document.createElement("div");msg.className="dbsr-field-error";msg.id="err-"+item.qid+"-"+i;msg.textContent=item.raw.replace(item.qid,"").replace(/^[\s:—-]+/,"");wrap.appendChild(msg);field.setAttribute("aria-describedby",msg.id);}
 });
 const items=parsed.map((item,i)=>'<li>'+(item.qid?'<a href="#status-'+escapeHtml(item.qid)+'" data-error-jump="'+escapeHtml(item.qid)+'"><strong>'+escapeHtml(item.qid)+'</strong></a> ':'')+escapeHtml(item.raw.replace(item.qid||"","").replace(/^[\s:—-]+/,""))+'</li>').join("");
 host.innerHTML="<div class=\"dbsr-validation-summary\" role=\"alert\"><h3>"+errors.length+" issue(s) need attention</h3><p>Correct the fields listed below. Other valid answers remain counted.</p><ul>"+items+"</ul></div>";
 host.className="dbsr-message error";
 host.querySelectorAll("[data-error-jump]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const target=$("status-"+a.dataset.errorJump);target?.scrollIntoView({behavior:"smooth",block:"center"});target?.focus();}));
}
function updateResults(){
 const evidenceValidation=Array.isArray(evidenceArtifacts)?evidenceApi.validateInventory(evidenceArtifacts):{valid:false};
 const assessment=core.assess({answers:answers,evidenceArtifacts:evidenceValidation.valid?evidenceArtifacts:null});
 const errors=Array.isArray(assessment.errors)?assessment.errors:[];
 const invalidQids=new Set(errors.map(e=>{const m=String(e).match(/\b([A-Z]{3}-\d{2})\b/);return m?m[1]:null;}).filter(Boolean));
 const answered=core.QUESTIONS.filter(q=>answers[q.id]&&answers[q.id].status).length;
 const invalidCount=invalidQids.size;
 const validAnswered=core.QUESTIONS.filter(q=>answers[q.id]&&answers[q.id].status&&!invalidQids.has(q.id)).length;
 const unresolved=Math.max(0,core.QUESTIONS.length-answered);
 $("dbsr-assessed").textContent=String(validAnswered);
 $("dbsr-resolved").textContent=String(validAnswered);
 $("dbsr-unresolved").textContent=String(unresolved);
 $("dbsr-pillar-count").textContent=String(new Set(core.QUESTIONS.filter(q=>answers[q.id]&&answers[q.id].status&&!invalidQids.has(q.id)).map(q=>q.pillarId)).size)+" / 7";
 $("dbsr-progress").style.width=(validAnswered/core.QUESTIONS.length*100)+"%";
 $("dbsr-score").textContent=assessment.maturityScore===null?"—":assessment.maturityScore.toFixed(2)+"%";
 $("dbsr-band").textContent=assessment.scoreDisposition==="diagnostic-only-critical-failure"?(assessment.maturityBand||"Internal band")+" · diagnostic only; critical failure overrides readiness interpretation":(assessment.maturityBand||"Not available");
 $("dbsr-status").textContent=assessment.reportingStatus||"Assessment unavailable";
 const criticalOverride=String(assessment.reportingStatus||"").includes("Critical failure confirmed");
 const gateException=String(assessment.reportingStatus||"").includes("Critical-gate N/A exception");
 $("dbsr-status").className="dbsr-status "+(criticalOverride||gateException?"bad":assessment.maturityScore!==null?"good":"warn");
 $("dbsr-pillars").querySelectorAll(".dbsr-pillar").forEach(el=>{
  const pid=el.querySelector("h3").id.replace("pillar-","");
  const qs=core.QUESTIONS.filter(q=>q.pillarId===pid);
  const pillarErrors=qs.filter(q=>invalidQids.has(q.id)).length;
  const pillarAnswered=qs.filter(q=>answers[q.id]&&answers[q.id].status).length;
  const pillarValid=qs.filter(q=>answers[q.id]&&answers[q.id].status&&!invalidQids.has(q.id)).length;
  const p=assessment.pillars&&assessment.pillars.find(x=>x.id===pid);
  const prefix=pillarAnswered===0?"Not assessed yet":pillarErrors?"Partially assessed · "+pillarErrors+" question(s) need correction":p&&p.score!==null?p.score.toFixed(2)+"%":"Answers recorded";
  $("meta-"+pid).textContent=prefix+" · "+pillarValid+"/4 valid answers · "+Math.max(0,4-pillarAnswered)+" unanswered";
 });
 $("dbsr-gates").innerHTML=(assessment.criticalGates||[]).map(g=>'<div class="dbsr-gate"><strong>'+escapeHtml(g.questionId)+' — '+escapeHtml(g.status)+'</strong><span class="dbsr-muted">'+escapeHtml(g.rationale)+'</span></div>').join("")||'<div class="dbsr-empty">No critical-gate results available yet.</div>';
 if(evidenceArtifacts===null){$("dbsr-message").textContent="Evidence inventory JSON is invalid. Fix the JSON before exporting.";$("dbsr-message").className="dbsr-message error";}else if(!assessment.valid){renderValidationErrors(errors);}else{renderValidationErrors([]);}
 $("dbsr-evidence-summary").textContent=evidenceArtifacts===null?"Invalid JSON":(evidenceApi.validateInventory(evidenceArtifacts).valid?evidenceApi.validateInventory(evidenceArtifacts).summary.artifactCount+" artifact(s), "+evidenceApi.validateInventory(evidenceArtifacts).summary.questionLinks+" question link(s).":"Evidence inventory errors: "+evidenceApi.validateInventory(evidenceArtifacts).errors.join(" "));
}
function payload(){syncFromInputs();if(evidenceArtifacts===null)throw new Error("Evidence inventory JSON is invalid.");const ev=evidenceApi.validateInventory(evidenceArtifacts);if(!ev.valid)throw new Error(ev.errors.join("\n"));return {schemaVersion:1,product:"DBSRF",exportedAt:new Date().toISOString(),assessment:{answers:answers},evidenceArtifacts:evidenceArtifacts};}
function downloadText(name,text){const blob=new Blob([text],{type:"application/json;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function showMessage(text,isError){$("dbsr-message").textContent=text;$("dbsr-message").className="dbsr-message"+(isError?" error":"");}
renderQuestions();
$("dbsr-pillars").addEventListener("change",e=>{
 const target=e.target;if(!target.dataset.qid)return;
 setVisibility(target.dataset.qid);syncFromInputs();
});
$("dbsr-evidence-json").value="[]";
$("dbsr-sample-evidence").addEventListener("click",()=>{
 const sample=[{id:"SAMPLE-EV-001",version:1,artifactDate:"2026-10-25",owner:"Illustrative control owner",confidence:"Unverified",status:"Collected",questionLinks:[{questionId:"GOV-01",relevance:"Relevant",sufficiency:"Not assessed"}]}];
 evidenceArtifacts=sample;$("dbsr-evidence-json").value=JSON.stringify(sample,null,2);syncFromInputs();showMessage("Illustrative sample loaded. It is not verified evidence; replace or remove it before assessing real controls.",false);
});
$("dbsr-recalculate").addEventListener("click",()=>syncFromInputs());
$("dbsr-print").addEventListener("click",()=>{syncFromInputs();window.print();});
$("dbsr-clear").addEventListener("click",()=>{
 if(!confirm("Clear all answers and evidence from this page? This cannot be undone unless you have an encrypted export."))return;
 answers={};evidenceArtifacts=[];$("dbsr-evidence-json").value="[]";
 core.QUESTIONS.forEach(q=>{const card=document.querySelector('[data-qid="'+q.id+'"]').closest(".dbsr-question");card.querySelectorAll("input,select,textarea").forEach(el=>{if(el.type==="checkbox")el.checked=false;else el.value="";});setVisibility(q.id);});
 updateResults();showMessage("Current in-memory assessment cleared.",false);
});
$("dbsr-export").addEventListener("click",async()=>{
 try{const p=payload();const password=$("dbsr-password").value;const envelope=await storage.encryptExport(p,password);downloadText("dbsrf-encrypted-export.json",JSON.stringify(envelope,null,2));showMessage("Encrypted export prepared. Store the file and password separately; the password cannot be recovered.",false);}
 catch(e){showMessage(e.message||"Could not encrypt export.",true);}
});
$("dbsr-import").addEventListener("click",async()=>{
 try{
  const file=$("dbsr-import-file").files[0];if(!file)throw new Error("Choose an encrypted DBSRF export file first.");
  if(file.size>15*1024*1024)throw new Error("Import file exceeds the 15 MB limit.");
  const envelope=JSON.parse(await file.text());
  const p=await storage.decryptExport(envelope,$("dbsr-password").value,x=>x&&x.product==="DBSRF"&&x.schemaVersion===1&&x.assessment&&x.assessment.answers&&Array.isArray(x.evidenceArtifacts));
  const val=core.validateAssessment(p.assessment);if(!val.valid)throw new Error("Assessment validation failed: "+val.errors.join(" "));
  const ev=evidenceApi.validateInventory(p.evidenceArtifacts);if(!ev.valid)throw new Error("Evidence validation failed: "+ev.errors.join(" "));
  answers=p.assessment.answers;evidenceArtifacts=p.evidenceArtifacts;$("dbsr-evidence-json").value=JSON.stringify(evidenceArtifacts,null,2);
  core.QUESTIONS.forEach(q=>{const card=document.querySelector('[data-qid="'+q.id+'"]').closest(".dbsr-question");card.querySelectorAll("input,select,textarea").forEach(el=>{if(el.type==="checkbox")el.checked=false;else el.value="";});});
  renderQuestionValues();syncFromInputs();showMessage("Encrypted assessment imported and validated. It remains in this page's memory only until you leave or reload.",false);
 }catch(e){showMessage(e.message||"Could not import encrypted file.",true);}
});
$("dbsr-evidence-json").addEventListener("input",syncFromInputs);
$("dbsr-password").addEventListener("input",()=>{});
updateResults();
})();