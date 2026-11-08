(() => {
"use strict";
const billingMode="DEMO";
const menuButton=document.querySelector(".gaas-nav .menu");
const nav=document.getElementById("gaas-main-nav");
const modal=document.getElementById("plan-modal");
const modalPlan=document.getElementById("modal-plan-name");
const demoButton=document.getElementById("run-demo");
const demoDomain=document.getElementById("demo-domain");
const demoOutput=document.getElementById("demo-output");
if(menuButton&&nav){menuButton.addEventListener("click",()=>{const open=menuButton.getAttribute("aria-expanded")!=="true";menuButton.setAttribute("aria-expanded",String(open));menuButton.setAttribute("aria-label",open?"Close menu":"Open menu");document.querySelector(".gaas-nav").classList.toggle("open",open);});nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{menuButton.setAttribute("aria-expanded","false");menuButton.setAttribute("aria-label","Open menu");document.querySelector(".gaas-nav").classList.remove("open");}));}
const demoContent={
payments:{area:"Payments operations",impact:"Potential operational and third-party incident-management impact",priority:"Illustrative: High",candidate:"Documented escalation arrangements and periodic testing evidence",actions:["Identify payment services and operational teams potentially in scope.","Locate incident escalation procedures and third-party service schedules.","Request evidence of periodic testing and accountable oversight.","Record unresolved applicability and effective-date questions for reviewer assessment."]},
outsourcing:{area:"Third-party / outsourcing risk",impact:"Potential supplier oversight and contractual-control impact",priority:"Illustrative: High",candidate:"Third-party incident escalation, accountability and test evidence",actions:["Identify critical or material third-party arrangements potentially in scope.","Map supplier notification and escalation clauses to internal procedures.","Check ownership, escalation contacts and test records.","Record any potential gap for independent human review."]},
governance:{area:"Governance and oversight",impact:"Potential accountability and management-information impact",priority:"Illustrative: Moderate",candidate:"Named oversight responsibility and evidence of periodic challenge",actions:["Identify the accountable management function and committee.","Check whether responsibilities are documented and approved.","Review management reporting and challenge evidence.","Submit the candidate assessment to an independent reviewer."]}
};
if(demoButton&&demoDomain&&demoOutput){demoButton.addEventListener("click",()=>{const item=demoContent[demoDomain.value]||demoContent.payments;demoOutput.innerHTML='<div class="demo-result"><div class="demo-result-kicker">SIMULATED OUTPUT · NO AI CALL</div><h3>Candidate impact summary</h3><p>This fixed demonstration output is associated with the fictional GPSB-2026-004 notice. It is not a finding about any real jurisdiction or regulated entity.</p><div class="demo-result-grid"><div><span>Selected business area</span><strong>'+item.area+'</strong></div><div><span>Indicative priority</span><strong>'+item.priority+'</strong></div><div><span>Potential impact</span><strong>'+item.impact+'</strong></div><div><span>Candidate control theme</span><strong>'+item.candidate+'</strong></div></div><h4>Illustrative review actions</h4><ul>'+item.actions.map(action=>'<li>'+action+'</li>').join("")+'</ul><div class="demo-review-note"><strong>Human review required.</strong> Source authenticity, legal status, jurisdictional applicability, effective date, affected entity scope and control sufficiency have not been verified.</div></div>';});}
let lastPlanTrigger=null;
const planWorkflows={
"Free Explorer":{
subtitle:"Source discovery and regulatory orientation",
steps:["Choose jurisdiction and regulatory topic.","Describe what you want to find.","Review a source-discovery brief and verification checklist."],
fields:[["jurisdiction","Jurisdiction","select",["Bangladesh","United Kingdom","European Union","United States","Singapore","Other / multi-jurisdiction"],true],["topic","Regulatory topic","select",["AML/CFT","Payments","Prudential regulation","Governance","Data protection","Outsourcing / third party"],true],["role","Professional role","select",["Compliance officer","Supervisor / regulator","Auditor","Risk manager","Legal / regulatory analyst","Business owner","Other professional"],true],["authority","Regulator or issuing authority (optional)","text","",false],["question","Specific research question","text","e.g. What current AML/CFT requirements apply to licensed NBFIs?",true]],
title:"Regulatory Source Discovery Brief",
rows:v=>[["Search scope",v.jurisdiction+" · "+v.topic],["Professional role",v.role],["Authority filter",v.authority||candidateAuthorities(v.jurisdiction,v.topic)],["Research question",v.question],["Primary-source register","For each candidate source, capture issuing authority; instrument title and reference; publication date; effective date; official URL; legal status; jurisdiction."],["Verification checklist","Confirm regulator domain, original instrument, amendments, current status, effective date and applicability."],["Next steps","Search official authority publications, record instrument metadata and submit each candidate source for analyst verification."]]
},
"Professional":{
subtitle:"Individual regulatory change impact assessment",
steps:["Enter a public instrument and affected business area.","Map candidate obligations to processes and controls.","Generate an individual analyst impact brief."],
fields:[["jurisdiction","Jurisdiction","select",["Bangladesh","United Kingdom","European Union","United States","Singapore","Other"],true],["instrument","Circular / notice title or reference","text","",true],["authority","Issuing authority","text","",true],["business","Affected business area","select",["Payments operations","Retail banking","Corporate banking","Trade finance","Treasury / FX","AML/CFT","Outsourcing"],true],["process","Relevant internal process","text","",true],["control","Existing policy or control reference","text","",false]],
title:"Individual Change Impact Brief",
rows:v=>[["Instrument profile",v.instrument+" · "+v.authority+" · "+v.jurisdiction],["Business area and process",v.business+" — "+v.process],["Existing control reference",v.control||"Not provided — control inventory review required"],["Potential impact","Assess whether "+v.process+" is affected. Applicability and obligation wording remain unverified."],["Candidate mapping","Regulatory requirement → business process → policy / control → evidence owner. Verify each link against the original instrument."],["Review actions","Verify source and legal status; extract exact clauses; determine effective date; confirm entity and product scope; document rationale."]]
},
"Professional Plus":{
subtitle:"Structured workpaper and control-evidence assessment",
steps:["Capture instrument, obligation and affected control.","Assess evidence sufficiency and candidate gaps.","Generate a workpaper with reviewer challenge points."],
fields:[["instrument","Instrument reference","text","",true],["obligation","Candidate obligation / clause","text","",true],["process","Affected process","text","",true],["control","Control ID and description","text","",true],["evidence","Evidence currently available","select",["Approved policy and operating procedure","Procedure only","Testing evidence only","No evidence identified","Evidence not yet assessed"],true],["owner","Proposed control owner","text","",false]],
title:"Structured Regulatory Workpaper",
rows:v=>[["Instrument / obligation",v.instrument+" — "+v.obligation],["Process and control",v.process+" · "+v.control],["Evidence position",v.evidence],["Candidate gap","Evidence sufficiency and control design / operating effectiveness require testing. This preview makes no definitive gap conclusion."],["Proposed owner",v.owner||"To be assigned by accountable business function"],["Workpaper test steps","Inspect approved policy; trace procedure to obligation; sample operating evidence; verify frequency and exceptions; record test population and results."],["Reviewer challenge","Is the source binding and applicable? Does the control address the exact clause? Is evidence current, complete and independently validated?"],["Remediation record","Document agreed action, accountable owner, target date, completion evidence and independent retest."]]
},
"Small Business":{
subtitle:"Team action register for a small fintech or advisory firm",
steps:["Describe your organisation and regulatory change.","Nominate team roles and target completion date.","Generate a shared action register and management summary."],
fields:[["entity","Business type","select",["Fintech","Payment service provider","Financial advisory firm","Small financial institution","Other regulated business"],true],["jurisdiction","Operating jurisdiction","select",["Bangladesh","United Kingdom","European Union","Singapore","Other"],true],["change","Regulatory change / topic","text","",true],["team","Functions involved","select",["Compliance and Operations","Compliance and Technology","Risk, Compliance and Operations","All business functions"],true],["owner","Executive sponsor / accountable lead role","text","e.g. Head of Compliance",true],["due","Target review date","date","",true]],
title:"Small Business Regulatory Action Register",
rows:v=>[["Organisation profile",v.entity+" · "+v.jurisdiction],["Change under review",v.change],["Participating functions",v.team],["Action owner",v.owner],["Target review date",v.due],["Action 1 — Compliance","Verify original instrument, legal status, applicability and effective date."],["Action 2 — Business owner","Identify affected service, process, customer journey and operational dependency."],["Action 3 — Control owner","Check policy, procedure, control design and evidence; record candidate gaps."],["Management summary","Review open actions at the agreed governance forum. Status remains Pending until evidence is submitted and closure is validated."]]
},
"Business Plus":{
subtitle:"Multi-workstream governance and portfolio oversight",
steps:["Define institution profile, jurisdictions and change theme.","Set governance ownership and workstreams.","Generate a portfolio oversight pack and management information."],
fields:[["institution","Institution / business profile","select",["Growing bank / NBFI","Multi-entity fintech","Payment group","Financial services group","Advisory network"],true],["jurisdictions","Jurisdiction coverage","text","",true],["theme","Regulatory theme","select",["AML/CFT and sanctions","Payments and operational resilience","Prudential and governance","Third-party / outsourcing","Data and AI governance"],true],["committee","Oversight forum / accountable committee","text","e.g. Risk and Compliance Committee",true],["workstreams","Number of workstreams","select",["2","3","4","5+"],true],["integration","Management reporting output","select",["Management dashboard and action tracker","GRC / issue register","Document repository and evidence register","Management dashboard plus document repository"],true]],
title:"Business Plus Governance Oversight Pack",
rows:v=>[["Institution profile",v.institution],["Jurisdiction scope",v.jurisdictions],["Regulatory theme",v.theme],["Oversight forum",v.committee],["Workstream model",v.workstreams+" workstreams — source governance; interpretation; business impact; control remediation; independent assurance as applicable."],["Reporting need",v.integration],["Management indicators","Changes identified; source verification pending; impact assessments open; controls requiring review; overdue actions; evidence awaiting validation; retests outstanding."],["Governance checkpoints","Approve scope; confirm owners; challenge impact ratings; review overdue actions; validate closure evidence; retain committee decisions."],["Implementation note","Shared workspace, integrations, team capacity and governed workflow require technical and security scoping before production use."]]
},
"Enterprise":{
subtitle:"Institutional discovery and implementation scoping",
steps:["Describe institution, entities and jurisdiction footprint.","Identify security, integration and governance requirements.","Generate an enterprise discovery brief for consultation."],
fields:[["institution","Institution type","select",["Commercial bank","Central / development bank","NBFI","Insurance group","Large fintech / payment group","Other financial institution"],true],["jurisdictions","Jurisdictions and legal entities","text","",true],["users","Indicative user population","select",["Up to 50","51–250","251–1,000","More than 1,000"],true],["systems","Systems to assess for integration","text","Name core banking, GRC, document or identity systems",true],["security","Security / deployment requirement","select",["Cloud security review","Private cloud / dedicated environment","On-premises assessment","Requirements not yet defined"],true],["governance","Executive sponsor / governance forum","text","e.g. CIO and Board Risk Committee",true]],
title:"Enterprise Discovery and Scoping Brief",
rows:v=>[["Institution type",v.institution],["Jurisdiction / entity footprint",v.jurisdictions],["Indicative user population",v.users],["Systems landscape",v.systems||"To be established during discovery"],["Security / deployment",v.security],["Executive governance",v.governance||"Sponsor to be identified"],["Discovery workstreams","Regulatory coverage; identity and access; data classification; integration architecture; maker-checker workflow; audit logging; resilience and support."],["Required institutional inputs","Architecture and security requirements; jurisdiction/entity inventory; user roles; data-flow map; retention requirements; procurement and third-party risk criteria."],["Next step","Arrange scoped discovery. No price, implementation commitment, security certification or production capability is implied."]
]}
};
function esc(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function openPlan(button){
if(billingMode!=="DEMO"||!modal||!modalPlan)return;
const card=button.closest(".price-card");
const plan=(button.getAttribute("data-plan")||"Selected plan").trim();
const config=planWorkflows[plan];if(!config)return;
modalPlan.textContent=plan+" — interactive demo";
const audience=modal.querySelector("#modal-plan-audience");
if(audience)audience.textContent=(card?.querySelector(".price-audience")?.textContent.trim()||"Plan preview")+" · "+config.subtitle;
const workspace=modal.querySelector("#plan-demo-workspace");if(!workspace)return;
const fields=config.fields.map(f=>{
let control="";
if(f[2]==="select")control='<select id="field-'+f[0]+'" name="'+f[0]+'" required><option value="">Select an option</option>'+f[3].map(o=>'<option value="'+esc(o)+'">'+esc(o)+'</option>').join("")+'</select>';
else control='<input id="field-'+f[0]+'" name="'+f[0]+'" type="'+(f[2]==="date"?"date":"text")+'" placeholder="'+esc(f[3])+'" '+(f[4]?"required":"")+'>';
return '<label class="plan-field"><span>'+esc(f[1])+(f[4]?' <b>*</b>':"")+'</span>'+control+'</label>';
}).join("");
workspace.innerHTML='<div class="plan-demo-steps"><strong>How this plan works</strong><ol>'+config.steps.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol></div><form id="plan-demo-form" class="plan-demo-form"><div class="plan-form-heading"><strong>Try the '+esc(plan)+' workflow</strong><span>Sample inputs only · Do not enter confidential data</span></div><div class="plan-fields">'+fields+'</div><button class="btn primary plan-generate" type="submit">Run '+esc(plan)+' demo and generate output</button></form><div id="plan-demo-result" class="plan-demo-result" aria-live="polite"><div class="plan-result-empty"><strong>Your '+esc(plan)+' output will appear here.</strong><span>Complete the fields and run the demo to generate a plan-specific sample deliverable.</span></div></div><div class="plan-scope"><strong>Plan features shown on pricing page</strong><ul id="modal-plan-features"></ul></div>';
const featureList=workspace.querySelector("#modal-plan-features");
if(featureList&&card)card.querySelectorAll("li").forEach(item=>{const li=document.createElement("li");li.textContent=item.textContent.trim();featureList.appendChild(li);});
lastPlanTrigger=button;modal.hidden=false;document.body.classList.add("modal-open");
const close=modal.querySelector(".modal-close");if(close)close.focus();
}
function candidateAuthorities(jurisdiction,topic){
if(jurisdiction==="Bangladesh")return "Candidate official sources to verify: Bangladesh Bank (banking, NBFI and payment-system matters); Bangladesh Financial Intelligence Unit (AML/CFT matters). Confirm mandate and relevance for the specific entity and topic.";
if(jurisdiction==="United Kingdom")return "Candidate official sources to verify: Financial Conduct Authority, Prudential Regulation Authority / Bank of England, HM Treasury and relevant legislation. Select the authority based on the regulated activity.";
if(jurisdiction==="Singapore")return "Candidate official source to verify: Monetary Authority of Singapore, subject to entity type and regulated activity.";
return "Identify the competent regulator and original issuing authority for the selected jurisdiction and activity; this is a candidate list, not verified source coverage.";
}
function dateStatus(value){const due=new Date(value+"T00:00:00"),today=new Date();today.setHours(0,0,0,0);if(!value||Number.isNaN(due.getTime()))return "Date requires confirmation";const days=Math.floor((today-due)/86400000);return days>0?"OVERDUE — "+days+" day(s) past target":days===0?"Due today":"Upcoming — target date not yet reached";}
function validatePlan(plan,values){
const config=planWorkflows[plan],errors=[],warnings=[],junk=/^(?:nil|none|n\/?a|not known|unknown|f{2,}|[a-z]{1,3}|[a-z0-9]{7,})$/i;
config.fields.forEach(f=>{const value=values[f[0]]||"";if(f[4]&&!value)errors.push(f[1]+" is required.");if(f[2]==="text"&&value&&(junk.test(value)||value.length<4))errors.push(f[1]+" contains a placeholder or insufficient detail.");});
if(plan==="Free Explorer"&&values.question&&values.question.length<20)errors.push("Research question must describe the regulatory issue, not only your job role.");
if(plan==="Small Business"&&values.due){const due=new Date(values.due+"T00:00:00"),today=new Date();today.setHours(0,0,0,0);if(due<today)warnings.push(dateStatus(values.due)+". Confirm whether this is a new target or an overdue action.");}
if(plan==="Business Plus"&&/^(none|not provided)$/i.test(values.committee))warnings.push("No oversight forum is identified; committee decision checkpoints require an agreed accountable forum.");
if(plan==="Enterprise"&&/^(yes|no|own|none)$/i.test(values.systems))errors.push("Name the systems to assess, or describe the inventory as pending.");
if(plan==="Enterprise"&&/^(yes|no|own|none)$/i.test(values.governance))errors.push("Identify an executive sponsor role or governance forum.");
if(plan==="Enterprise"&&/^(laws|circular check)$/i.test(values.jurisdictions))errors.push("Enter a jurisdiction or entity footprint, not a generic category or unrelated value.");
if(plan==="Business Plus"&&/^laws$/i.test(values.jurisdictions))errors.push("Enter the countries or jurisdictions in scope, not the word Laws.");
if(plan==="Professional"&&/give exposure/i.test(values.process))errors.push("Replace the placeholder process with a meaningful business process.");
if(plan==="Professional Plus"&&/not known/i.test(values.process)&&/^Approved/.test(values.evidence))warnings.push("Evidence is marked approved while the process is unknown. Confirm that the evidence relates to the stated process and control.");
if(plan==="Professional"&&/not a legal instrument|illustrative/i.test(values.instrument)&&/bank|regulator|authority/i.test(values.authority))warnings.push("The instrument is described as illustrative / non-legal but an issuing authority is named. Separate fictional examples from real authority-issued instruments.");
if(plan==="Small Business"&&/United Kingdom/i.test(values.jurisdiction)&&/\bMFS\b/i.test(values.change))warnings.push("MFS is undefined in this UK profile. Expand the acronym and confirm jurisdictional relevance.");
return {errors,warnings};
}
function generatePlanOutput(form){
const plan=modalPlan.textContent.replace(" — interactive demo","");
const config=planWorkflows[plan];if(!config)return;
const values={};config.fields.forEach(f=>{values[f[0]]=form.elements[f[0]]?.value?.trim()||"";});
const result=modal.querySelector("#plan-demo-result");
const validation=validatePlan(plan,values);
if(validation.errors.length){result.innerHTML="<div class=\"plan-validation-error\"><strong>Report not generated — correct these inputs:</strong><ul>"+validation.errors.map(e=>"<li>"+esc(e)+"</li>").join("")+"</ul></div>";return;}
const rows=config.rows(values);
if(validation.warnings.length)rows.push(["Input consistency warnings",validation.warnings.join(" ")]);
const resultId="RNX-"+plan.replace(/[^A-Z]/gi,"").slice(0,3).toUpperCase()+"-"+new Date().toISOString().slice(0,10).replace(/-/g,"")+"-"+Math.random().toString(36).slice(2,7).toUpperCase();
result.innerHTML='<div class="plan-result-document"><div class="plan-result-banner"><span>LOCAL SIMULATION · NOT A LIVE REGULATORY ANALYSIS</span><strong>'+esc(config.title)+'</strong><small>'+esc(plan)+' · Generated in this browser only</small></div><div class="plan-result-reference"><span>DEMO RECORD</span><strong>'+esc(resultId)+'</strong><span>STATUS: DRAFT — HUMAN REVIEW REQUIRED</span></div><div class="plan-result-rows">'+rows.map(row=>'<section><strong>'+esc(row[0])+'</strong><p>'+esc(row[1])+'</p></section>').join("")+'</div><div class="plan-result-warning"><strong>Validation boundary</strong><p>This deterministic sample uses only the values entered above. It does not verify a source, interpret law, assess actual compliance or create a real remediation decision. An authorised professional must validate all findings.</p></div><div class="plan-result-actions"><button type="button" class="plan-print" id="print-plan-output">Print / Save sample</button><button type="button" class="plan-reset" id="reset-plan-output">Edit inputs</button></div></div>';
const printButton=result.querySelector("#print-plan-output");if(printButton)printButton.addEventListener("click",()=>window.print());
const resetButton=result.querySelector("#reset-plan-output");if(resetButton)resetButton.addEventListener("click",()=>form.scrollIntoView({behavior:"smooth",block:"start"}));
}
document.addEventListener("submit",event=>{if(event.target&&event.target.id==="plan-demo-form"){event.preventDefault();if(event.target.reportValidity())generatePlanOutput(event.target);}});
function closePlan(){if(!modal)return;modal.hidden=true;document.body.classList.remove("modal-open");if(lastPlanTrigger)lastPlanTrigger.focus();}
document.querySelectorAll("[data-plan]").forEach(button=>button.addEventListener("click",()=>openPlan(button)));
document.querySelectorAll("[data-close-modal]").forEach(element=>element.addEventListener("click",closePlan));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&modal&&!modal.hidden)closePlan();});
})();