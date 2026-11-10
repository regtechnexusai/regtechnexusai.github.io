(() => {
"use strict";
const COUNTRY_OPTIONS=["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Republic of the)","Costa Rica","Côte d’Ivoire","Croatia","Cuba","Cyprus","Czechia","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Türkiye","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe","European Union","Other / multi-jurisdiction"];
function sampleHint(key,label,oldHint){
 const hints={jurisdiction:"e.g. Bangladesh",legalEntities:"e.g. ABC Bank PLC, ABC Finance Ltd",jurisdictions:"Select one or more countries from the list",authority:"e.g. Bangladesh Bank / BFIU",question:"e.g. Which current AML/CFT requirements apply to licensed NBFIs?",instrument:"e.g. Bangladesh Bank BRPD Circular No. 05",business:"Choose the affected business area",process:"e.g. Customer onboarding and periodic KYC review",control:"e.g. KYC-CTRL-04 — periodic customer risk review",obligation:"e.g. Requirement to review customer risk profiles periodically",owner:"e.g. Head of Compliance",entity:"Choose the institution or business type",change:"e.g. New AML/CFT circular on customer due diligence",team:"Choose the functions involved",due:"Choose a target review date",institution:"Choose the institution profile",theme:"Choose the regulatory theme",committee:"e.g. Board Risk Committee / Compliance Committee",workstreams:"Choose the number of workstreams",integration:"Choose the required management reporting output",users:"Choose the expected user population",systems:"e.g. Core Banking, AML Monitoring, GRC, Document Management",security:"Choose a security or deployment requirement",governance:"e.g. CIO and Board Risk Committee"};
 return hints[key]||oldHint||("e.g. Enter "+label.toLowerCase());
}

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
const planGuides={
"Free Explorer":{input:"Jurisdiction, regulatory topic, professional role and a specific research question.",process:"Guided product preview: checks required fields and suggests likely competent authorities without searching or retrieving publications. Separate Phase 1 Live Research: after Turnstile, sends the structured request to the staging API; the current mock provider does not search sources or retrieve publications.",output:"The guided preview produces a research brief and source-verification checklist. The separate staging workflow currently returns a clearly labelled mock response with zero verified citations; it is not a regulatory research result.",next:"Production research requires an approved provider, official-source discovery and retrieval, citation validation, current-status checks and human acceptance. The staging mock is only an integration test."},
"Professional":{input:"Jurisdiction, instrument title/reference, issuing authority, affected business area, internal process and optional control reference.",process:"The demo structures the information into a candidate impact record. It does not download the instrument, extract clauses or test applicability.",output:"An individual change-impact intake brief with candidate mapping and review actions—not a completed impact assessment.",next:"A live version must retrieve the official instrument, verify identity/status/dates, extract relevant clauses and ask the analyst to confirm entity applicability."},
"Professional Plus":{input:"Instrument reference, candidate obligation, affected process, control ID/description, evidence position and optional owner.",process:"The demo organises supplied information into a workpaper structure. It does not inspect uploaded evidence, test a control or validate the source.",output:"A draft workpaper with test steps, reviewer questions and remediation fields—not an audit finding or assurance opinion.",next:"A live version must ingest authorised source/evidence documents, link each conclusion to page/paragraph evidence and require reviewer sign-off."},
"Small Business":{input:"Business type, jurisdiction, regulatory change/topic, participating functions, accountable lead role and target date.",process:"The demo validates required fields, flags overdue dates and creates generic functional action prompts.",output:"A starter action register. It does not identify the actual legal obligations or determine the firm's exposure.",next:"A live version must verify the relevant instrument, tailor actions to the firm's activities and support owner updates and evidence of completion."},
"Business Plus":{input:"Institution profile, jurisdiction coverage, regulatory theme, oversight forum, workstream count and management-reporting need.",process:"The demo structures a governance and portfolio oversight outline using the information entered.",output:"A governance oversight pack outline and suggested management indicators—not a populated portfolio dashboard or verified action inventory.",next:"A live version must connect verified change records, entity/control inventories, action owners and approved GRC reporting data."},
"Enterprise":{input:"Institution type, legal-entity/jurisdiction footprint, user population, systems, security requirements and executive governance.",process:"The demo organises discovery requirements for a scoping discussion. It does not inspect systems, security architecture or institution records.",output:"An enterprise discovery brief for consultation—not a security assessment, implementation design or production-readiness certification.",next:"A live engagement must use approved architecture documents, security questionnaires, data-flow maps and controlled institutional discovery."}
};
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
rows:v=>[["Organisation profile",v.entity+" · "+v.jurisdiction],["Change under review",v.change],["Participating functions",v.team],["Action owner",v.owner],["Target review date",v.due],["Action status",dateStatus(v.due)],["Action 1 — Compliance","Verify original instrument, legal status, applicability and effective date."],["Action 2 — Business owner","Identify affected service, process, customer journey and operational dependency."],["Action 3 — Control owner","Check policy, procedure, control design and evidence; record candidate gaps."],["Management summary","Review open actions at the agreed governance forum. Status remains Pending until evidence is submitted and closure is validated."]]
},
"Business Plus":{
subtitle:"Multi-workstream governance and portfolio oversight",
steps:["Define institution profile, jurisdictions and change theme.","Set governance ownership and workstreams.","Generate a portfolio oversight pack and management information."],
fields:[["institution","Institution / business profile","select",["Growing bank / NBFI","Multi-entity fintech","Payment group","Financial services group","Advisory network"],true],["jurisdictions","Jurisdiction coverage","select",[],true],["instrument","Regulatory instrument / change reference","text","e.g. Circular, rule, notice or regulatory publication reference",true],["authority","Issuing regulator / competent authority","text","e.g. Bangladesh Bank / BFIU / relevant supervisory authority",true],["business","Affected business area(s)","text","e.g. Payments, trade finance, treasury, AML/CFT",false],["process","Affected process(es)","text","e.g. Customer onboarding, transaction monitoring, trade operations",false],["control","Existing policy / control references (optional)","text","e.g. AML-POL-04; KYC-CTRL-02",false],["theme","Regulatory theme","select",["AML/CFT and sanctions","Payments and operational resilience","Prudential and governance","Third-party / outsourcing","Data and AI governance"],true],["committee","Oversight forum / accountable committee","text","e.g. Risk and Compliance Committee",true],["workstreams","Number of workstreams","select",["2","3","4","5+"],true],["integration","Management reporting output","select",["Management dashboard and action tracker","GRC / issue register","Document repository and evidence register","Management dashboard plus document repository"],true]],
title:"Business Plus Governance Oversight Pack",
rows:v=>[["Institution profile",v.institution],["Jurisdiction scope",v.jurisdictions],["Regulatory instrument / authority",v.instrument+" · "+v.authority],["Affected business and processes",(v.business||"Not specified")+" · "+(v.process||"Not specified")],["Existing policy / control references",v.control||"To be mapped during impact assessment"],["Regulatory theme",v.theme],["Oversight forum",v.committee],["Workstream model",v.workstreams+" workstreams — source governance; interpretation; business impact; control remediation; independent assurance as applicable."],["Reporting need",v.integration],["Management indicators","Changes identified; source verification pending; impact assessments open; controls requiring review; overdue actions; evidence awaiting validation; retests outstanding."],["Governance checkpoints","Approve scope; confirm owners; challenge impact ratings; review overdue actions; validate closure evidence; retain committee decisions."],["Implementation note","Shared workspace, integrations, team capacity and governed workflow require technical and security scoping before production use."]]
},
"Enterprise":{
subtitle:"Institutional discovery and implementation scoping",
steps:["Describe institution, entities and jurisdiction footprint.","Identify security, integration and governance requirements.","Generate an enterprise discovery brief for consultation."],
fields:[["institution","Institution type","select",["Commercial bank","Central / development bank","NBFI","Insurance group","Large fintech / payment group","Other financial institution"],true],["jurisdictions","Jurisdiction coverage","select",[],true],["instrument","Regulatory instrument / change reference","text","e.g. Applicable rule, circular, notice or supervisory publication reference",true],["authority","Issuing regulator / competent authority","text","e.g. Relevant central bank, financial intelligence unit or supervisor",true],["business","Affected business area(s) (optional)","text","e.g. Retail banking, trade finance, treasury, payments",false],["process","Affected process(es) (optional)","text","e.g. KYC, transaction monitoring, trade operations",false],["control","Existing policy / control references (optional)","text","e.g. AML-POL-04; KYC-CTRL-02",false],["legalEntities","Legal entities in scope","text","e.g. Parent bank, subsidiaries and branches",false],["users","Indicative user population","select",["Up to 50","51–250","251–1,000","More than 1,000"],true],["systems","Systems to assess for integration","text","Name core banking, GRC, document or identity systems",true],["security","Security / deployment requirement","select",["Cloud security review","Private cloud / dedicated environment","On-premises assessment","Requirements not yet defined"],true],["governance","Executive sponsor / governance forum","text","e.g. CIO and Board Risk Committee",true]],
title:"Enterprise Discovery and Scoping Brief",
rows:v=>[["Institution type",v.institution],["Jurisdiction coverage",Array.isArray(v.jurisdictions)?v.jurisdictions.join(", "):v.jurisdictions],["Regulatory instrument / authority",v.instrument+" · "+v.authority],["Affected business and processes",(v.business||"To be confirmed during discovery")+" · "+(v.process||"To be confirmed during discovery")],["Existing policy / control references",v.control||"To be mapped during institutional discovery"],["Legal entities in scope",v.legalEntities||"Not provided — confirm entity inventory"],["Indicative user population",v.users],["Systems landscape",v.systems||"To be established during discovery"],["Security / deployment",v.security],["Executive governance",v.governance||"Sponsor to be identified"],["Discovery workstreams","Regulatory coverage; identity and access; data classification; integration architecture; maker-checker workflow; audit logging; resilience and support."],["Required institutional inputs","Architecture and security requirements; jurisdiction/entity inventory; user roles; data-flow map; retention requirements; procurement and third-party risk criteria."],["Next step","Arrange scoped discovery. No price, implementation commitment, security certification or production capability is implied."]
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
if(f[2]==="select"||f[0]==="jurisdiction"||f[0]==="jurisdictions"){
 const isCountry=f[0]==="jurisdiction"||f[0]==="jurisdictions";
 const opts=isCountry?COUNTRY_OPTIONS:f[3];
 const multi=f[0]==="jurisdictions";
 if(isCountry){
  control='<div class="country-select-wrap"><input class="country-filter" type="search" aria-label="Filter country and region options" placeholder="Type to filter country / region" data-filter-target="field-'+f[0]+'"><select id="field-'+f[0]+'" name="'+f[0]+'" data-country-select="true" aria-describedby="jurisdiction-hint" '+(multi?'multiple size="6"':'')+'>'+(multi?'':'<option value="">Choose a country / region</option>')+opts.map(o=>'<option value="'+esc(o)+'">'+esc(o)+'</option>').join("")+'</select></div>';
 }else{
  control='<select id="field-'+f[0]+'" name="'+f[0]+'"><option value="">Select an option</option>'+opts.map(o=>'<option value="'+esc(o)+'">'+esc(o)+'</option>').join("")+'</select>';
 }
}else{
 const hint=sampleHint(f[0],f[1],f[3]);
 control='<input id="field-'+f[0]+'" name="'+f[0]+'" type="'+(f[2]==="date"?"date":"text")+'" '+(f[2]==="date"?'title="Choose a target date"':'placeholder="'+esc(hint)+'"')+' autocomplete="off">'+(f[2]==="date"?'<small class="field-example">e.g. Select a target review date</small>':'');
}
const fieldLabel=f[0]==="jurisdiction"?"Country / Region":f[0]==="jurisdictions"?"Country / Region coverage":f[1];
return '<label class="plan-field"><span>'+esc(fieldLabel)+'</span>'+control+'</label>';
}).join("");
const hasJurisdictionField=config.fields.some(f=>f[0]==="jurisdiction"||f[0]==="jurisdictions");
const hasMultipleJurisdictions=config.fields.some(f=>f[0]==="jurisdictions");
const jurisdictionHint=hasJurisdictionField?'<p class="field-hint" id="jurisdiction-hint">Country / region selection is a scope indicator only. '+(hasMultipleJurisdictions?'Select all relevant jurisdictions.':'Select the relevant jurisdiction.')+'</p>':'';
workspace.innerHTML='<div class="plan-demo-steps"><strong>How this plan works</strong><ol>'+config.steps.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol></div><form id="plan-demo-form" class="plan-demo-form"><div class="plan-form-heading"><strong>Try the '+esc(plan)+' workflow</strong><span>Sample inputs only · Do not enter confidential data</span></div><div class="plan-fields">'+fields+'</div>'+jurisdictionHint+'<p class="field-hint" role="note"><strong>Document processing is not enabled in this public preview.</strong> Do not attach or submit files. Supporting documents are not uploaded, parsed or analysed.</p><button class="btn primary plan-generate" type="submit">Prepare research brief</button></form><div id="plan-demo-result" class="plan-demo-result" aria-live="polite"><div class="plan-result-empty"><strong>Your '+esc(plan)+' output will appear here.</strong><span>Complete the fields and run the demo to generate a plan-specific sample deliverable.</span></div></div><div class="plan-scope"><strong>Plan features shown on pricing page</strong><ul id="modal-plan-features"></ul></div>';
const guide=planGuides[plan];
const explain=document.createElement("div");
explain.className="plan-explainer";
explain.innerHTML='<section><strong>What you provide</strong><p>'+esc(guide.input)+'</p></section><section><strong>What the demo does</strong><p>'+esc(guide.process)+'</p></section><section><strong>What you receive</strong><p>'+esc(guide.output)+'</p></section><section><strong>What a live service would need</strong><p>'+esc(guide.next)+'</p></section>';
workspace.insertBefore(explain,workspace.querySelector("#plan-demo-form"));

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
const config=planWorkflows[plan],errors=[],warnings=[],junk=/^(?:nil|none|n\/?a|not known|unknown|f{2,}|e\.g\.?|placeholder|tbd|to be confirmed)$/i;
config.fields.forEach(f=>{const value=values[f[0]]??"";const missing=Array.isArray(value)?value.length===0:!String(value).trim();if(f[4]&&missing)errors.push(f[1]+" is required.");if(f[2]==="text"&&typeof value==="string"&&value&&(junk.test(value)||(f[0]!=="authority"&&value.length<4)))errors.push(f[1]+" contains a placeholder or insufficient detail.");});
if(plan==="Free Explorer"&&values.question&&values.question.length<20)errors.push("Research question must describe the regulatory issue, not only your job role.");
if(plan==="Small Business"&&values.due){const due=new Date(values.due+"T00:00:00"),today=new Date();today.setHours(0,0,0,0);if(due<today)warnings.push(dateStatus(values.due)+". Confirm whether this is a new target or an overdue action.");}
if(plan==="Business Plus"&&/^(none|not provided)$/i.test(values.committee))warnings.push("No oversight forum is identified; committee decision checkpoints require an agreed accountable forum.");
if(plan==="Enterprise"&&/^(yes|no|own|none)$/i.test(values.systems))errors.push("Name the systems to assess, or describe the inventory as pending.");
if(plan==="Enterprise"&&/^(yes|no|own|none)$/i.test(values.governance))errors.push("Identify an executive sponsor role or governance forum.");
if(plan==="Enterprise"&&/^(laws|circular check)$/i.test(values.jurisdictions))errors.push("Enter a jurisdiction or entity footprint, not a generic category or unrelated value.");
if((plan==="Business Plus"||plan==="Enterprise")&&Array.isArray(values.jurisdictions)&&values.jurisdictions.some(v=>/^(laws|circular check|not known)$/i.test(v)))errors.push("Select actual countries or regions for jurisdiction coverage; do not use a generic category or placeholder.");
if((plan==="Business Plus"||plan==="Enterprise")&&values.instrument&&/^(none|n\/?a|not known|unknown)$/i.test(values.instrument))errors.push("Provide an identifiable instrument or change reference, or clearly describe the source as pending.");
if(plan==="Professional"&&/give exposure/i.test(values.process))errors.push("Replace the placeholder process with a meaningful business process.");
if(plan==="Professional Plus"&&/not known/i.test(values.process)&&/^Approved/.test(values.evidence))warnings.push("Evidence is marked approved while the process is unknown. Confirm that the evidence relates to the stated process and control.");
if(plan==="Professional"&&/not a legal instrument|illustrative/i.test(values.instrument)&&/bank|regulator|authority/i.test(values.authority))warnings.push("The instrument is described as illustrative / non-legal but an issuing authority is named. Separate fictional examples from real authority-issued instruments.");
if(plan==="Small Business"&&/United Kingdom/i.test(values.jurisdiction)&&/\bMFS\b/i.test(values.change))warnings.push("MFS is undefined in this UK profile. Expand the acronym and confirm jurisdictional relevance.");
return {errors,warnings};
}
function generatePlanOutput(form){
 const plan=modalPlan.textContent.replace(" — interactive demo","");
 const config=planWorkflows[plan];if(!config)return;
 const values={};
 config.fields.forEach(f=>{const el=form.elements[f[0]];values[f[0]]=el?(el.multiple?Array.from(el.selectedOptions).map(o=>o.value).filter(Boolean):String(el.value||"").trim()):"";});
 const validation=validatePlan(plan,values);
 const result=modal.querySelector("#plan-demo-result");
 if(validation.errors.length){
  result.innerHTML='<div class="plan-validation-error" role="alert"><strong>More information is required before preparing this report.</strong><ul>'+validation.errors.map(message=>'<li>'+esc(message)+'</li>').join("")+'</ul></div>';
  return;
 }
 // Structured research instructions are assembled and submitted directly to the GaaS staging API.
 // Keep user-entered information out of URL query strings and browser navigation history.
 
 const validationWarnings=validation.warnings.length?validation.warnings.join(" "):"No additional validation warnings.";
 const supplied=Object.entries(values).filter(([,v])=>Array.isArray(v)?v.length:String(v||"").trim()).map(([k,v])=>k+": "+(Array.isArray(v)?v.join(", "):v)).join(" · ");
 result.innerHTML='<div class="plan-result-document"><div class="plan-result-banner"><span>GAAS LIVE RESEARCH · DIRECT SUBMISSION</span><strong>'+esc(config.title)+'</strong><small>'+esc(plan)+' · Your entered information is ready for direct submission</small></div><div class="plan-result-rows"><section><strong>Information included</strong><p>'+esc(supplied||"No information entered; missing facts will not be assumed.")+'</p></section><section><strong>Supporting documents</strong><p>Not supported in this public preview. No files are uploaded or processed.</p></section><section><strong>Research scope</strong><p>Guided Preview only validates and structures your inputs; it does not search regulator websites. The separate Phase 1 Live Research option sends the structured request to the staging API after Turnstile verification. The staging provider is currently mock-only: it does not search sources, retrieve publications or produce verified regulatory conclusions.</p></section><section><strong>Input validation notes</strong><p>'+esc(validationWarnings)+'</p></section></div><div class="plan-result-warning"><strong>Data handling</strong><p>Form fields are submitted directly to the GaaS staging research service when you run the research. Selected files are not uploaded or processed by this preview. Do not submit confidential bank/customer information, transaction records, SAR/STR data or restricted institutional material.</p></div></div>';
 // Live Phase 1 research is a separate, opt-in staging workflow. The editor handoff uses provider-neutral page labels.
 const livePanel=document.createElement("section");
 livePanel.className="gaas-live-research";
 livePanel.setAttribute("aria-labelledby","gaas-live-title");
 livePanel.innerHTML='<div class="gaas-live-heading"><span class="gaas-live-kicker">PHASE 1 · LIVE RESEARCH STAGING</span><h3 id="gaas-live-title">Run source-led regulatory research</h3><p>Uses the staging research API and Cloudflare Turnstile. Do not enter confidential, customer, transaction or restricted institutional information.</p></div><div class="gaas-live-challenge"><div id="gaas-turnstile-widget"></div><small id="gaas-turnstile-status" role="status">Complete the security check before running research.</small></div><button type="button" class="btn primary gaas-live-run" id="gaas-live-run" disabled>Run live regulatory research</button><div id="gaas-live-status" class="gaas-live-status" role="status" aria-live="polite"></div><div id="gaas-live-result" class="gaas-live-result" aria-live="polite"></div><p class="gaas-live-footnote">Staging only · AI-assisted research · human verification required · no document upload or account storage.</p>';
 result.appendChild(livePanel);
 const liveRun=livePanel.querySelector("#gaas-live-run");
 const turnstileStatus=livePanel.querySelector("#gaas-turnstile-status");
 const liveStatus=livePanel.querySelector("#gaas-live-status");
 const liveResult=livePanel.querySelector("#gaas-live-result");
 let liveToken="";
 let widgetId=null;
 const renderChallenge=()=>{
  if(!window.turnstile||widgetId!==null)return;
  const mount=livePanel.querySelector("#gaas-turnstile-widget");
  if(!mount)return;
  try{
   widgetId=window.turnstile.render(mount,{
    sitekey:"0x4AAAAAAF5yBlsssEZ2K6FF",
    action:"gaas_research",
    callback:(token)=>{liveToken=token;liveRun.disabled=false;turnstileStatus.textContent="Security check completed.";},
    "expired-callback":()=>{liveToken="";liveRun.disabled=true;turnstileStatus.textContent="Security check expired. Please complete it again.";},
    "error-callback":()=>{liveToken="";liveRun.disabled=true;turnstileStatus.textContent="Security check unavailable. Refresh and retry.";}
   });
  }catch(error){turnstileStatus.textContent="Security check could not load. Please refresh the page.";}
 };
 if(window.turnstile){renderChallenge();}
 else{
  const waitForTurnstile=()=>{if(window.turnstile)renderChallenge();};
  window.addEventListener("load",waitForTurnstile,{once:true});
  let attempts=0;
  const retry=setInterval(()=>{attempts++;waitForTurnstile();if(widgetId!==null||attempts>=20)clearInterval(retry);},500);
 }
 liveRun.addEventListener("click",async()=>{
  if(!liveToken){liveStatus.textContent="Complete the security check first.";return;}
  liveRun.disabled=true;
  liveStatus.textContent="Research is running. This may take a short time…";
  liveResult.replaceChildren();
  const jurisdiction=values.jurisdiction||(Array.isArray(values.jurisdictions)?values.jurisdictions.join(", "):"")||"Not specified by user";
  const topic=values.topic||values.theme||values.change||values.instrument||values.obligation||"Regulatory research and impact";
  const researchQuestion=[
   "Conduct current regulatory research for the selected GaaS workflow. Search the issuing regulator's official website and its publication pages, including relevant publications not present in curated source lists.",
   "User-provided scope (not independently verified):",
   ...Object.entries(values).map(([key,value])=>key+": "+(Array.isArray(value)?value.join(", "):String(value||"Not provided"))),
   "Distinguish binding instruments from guidance, consultation, reports and enforcement notices. Verify publication/effective dates, amendments and current status where evidence allows.",
   "Separate verified facts, AI analysis, assumptions, unverified items and human-review questions. Cite original official sources. Do not invent applicability, clauses, dates, internal controls or entity facts."
  ].join("\n").slice(0,2450);
  const payload={
   plan, jurisdiction, topic:String(topic).slice(0,190), question:researchQuestion,
   authority:values.authority||"",
   institution:values.institution||values.entity||"",
   businessArea:values.business||values.theme||values.entity||"",
   process:values.process||"",
   instrument:values.instrument||values.change||"",
   researchPeriod:"Current position at research date",
   language:"English",
   turnstileToken:liveToken
  };
  try{
   const response=await fetch("https://gaas-research-api-staging.regtechnexusai.workers.dev/api/research",{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),credentials:"omit",cache:"no-store"
   });
   const data=await response.json().catch(()=>({error:"The service returned an unreadable response."}));
   if(!response.ok){const diagnostic=[data.code?"Diagnostic: "+data.code:"",data.providerRequestId?"Provider request ID: "+data.providerRequestId:"",data.retryAfter?"Retry-After: "+data.retryAfter+" seconds":""].filter(Boolean).join(" · ");throw new Error((data.error||("Research request failed ("+response.status+")."))+(diagnostic?" ("+diagnostic+")":""));}
   liveStatus.textContent="Research response received. Human verification is still required.";
   const report=document.createElement("div");report.className="gaas-live-report";
   const heading=document.createElement("h4");heading.textContent=data.mock===true?"Staging mock response":"Research report";
   const meta=document.createElement("p");meta.className="gaas-live-meta";meta.textContent="Research date: "+(data.researchDate?new Date(data.researchDate).toLocaleString():"Not supplied")+" · "+plan;
   const body=document.createElement("div");body.className="gaas-live-report-text";body.textContent=data.report||"No report text returned.";
   report.append(heading,meta,body);
   const citationsHeading=document.createElement("h4");citationsHeading.textContent="Source citations ("+(Array.isArray(data.citations)?data.citations.length:0)+")";
   const citations=document.createElement("ol");citations.className="gaas-live-citations";
   (Array.isArray(data.citations)?data.citations:[]).forEach(item=>{
    try{
     const url=new URL(item.url);
     if(url.protocol!=="https:")return;
     const li=document.createElement("li"),a=document.createElement("a");
     a.href=url.href;a.target="_blank";a.rel="noopener noreferrer";a.textContent=item.title||url.hostname;
     li.appendChild(a);citations.appendChild(li);
    }catch(e){}
   });
   if(!citations.children.length){const li=document.createElement("li");li.textContent="No structured citations were returned. Treat all claims as unverified until independently sourced.";citations.appendChild(li);}
   const disclaimer=document.createElement("p");disclaimer.className="gaas-live-disclaimer";disclaimer.textContent=data.disclaimer||"AI-assisted research only. Verify original instruments, legal status, applicability and effective dates. Human review is required.";
   liveResult.append(report,citationsHeading,citations,disclaimer);
  }catch(error){
   liveStatus.textContent=error.message||"Research request failed. Please retry.";
  }finally{
   liveToken="";
   liveRun.disabled=true;
   if(window.turnstile&&widgetId!==null){try{window.turnstile.reset(widgetId);}catch(e){}}
   turnstileStatus.textContent="Complete the security check again before another request.";
  }
 });
 // Form data is submitted directly to the GaaS research API below; no clipboard or external-editor handoff is used.
}
document.addEventListener("input",event=>{
 const input=event.target;
 if(!input||!input.classList.contains("country-filter"))return;
 const target=document.getElementById(input.dataset.filterTarget);
 if(!target||target.dataset.countrySelect!=="true")return;
 const query=input.value.trim().toLocaleLowerCase();
 const multi=target.multiple;
 const selected=target._countrySelection instanceof Set
  ? new Set(target._countrySelection)
  : new Set(Array.from(target.selectedOptions).map(option=>option.value).filter(Boolean));
 const matches=COUNTRY_OPTIONS.filter(country=>country.toLocaleLowerCase().includes(query));
 const visibleCountries=[...matches,...Array.from(selected).filter(country=>!matches.includes(country))];
 const fragment=document.createDocumentFragment();
 if(!multi){
  const placeholder=document.createElement("option");
  placeholder.value="";
  placeholder.textContent="Choose a country / region";
  placeholder.selected=selected.size===0;
  fragment.appendChild(placeholder);
 }
 visibleCountries.forEach(country=>{
  const option=document.createElement("option");
  option.value=country;
  option.textContent=country;
  option.selected=selected.has(country);
  fragment.appendChild(option);
 });
 target.replaceChildren(fragment);
 if(multi){
  Array.from(target.options).forEach(option=>{option.selected=selected.has(option.value);});
 }else{
  target.value=selected.values().next().value||"";
 }
 target._countrySelection=selected;
});
document.addEventListener("change",event=>{
 const target=event.target;
 if(target&&target.dataset&&target.dataset.countrySelect==="true"){
  target._countrySelection=new Set(Array.from(target.selectedOptions).map(option=>option.value).filter(Boolean));
 }
});
document.addEventListener("submit",event=>{if(event.target&&event.target.id==="plan-demo-form"){event.preventDefault();generatePlanOutput(event.target);}});
function closePlan(){if(!modal)return;modal.hidden=true;document.body.classList.remove("modal-open");if(lastPlanTrigger)lastPlanTrigger.focus();}
// Use delegated capture-phase handling so plan buttons remain functional on mobile
// even if another component attaches handlers or the pricing cards are re-rendered.
document.addEventListener("click",event=>{
 const button=event.target&&event.target.closest?event.target.closest(".plan-button[data-plan]"):null;
 if(!button)return;
 event.preventDefault();
 try{
  openPlan(button);
  if(modal&&modal.hidden){
   const workspace=modal.querySelector("#plan-demo-workspace");
   if(workspace)workspace.innerHTML='<p role="alert" class="plan-validation-error">This plan preview could not be opened. Please reload the page and try again.</p>';
   modal.hidden=false;
   document.body.classList.add("modal-open");
  }
 }catch(error){
  console.error("GaaS plan preview failed:",error);
  if(modal){
   const workspace=modal.querySelector("#plan-demo-workspace");
   if(workspace)workspace.innerHTML='<p role="alert" class="plan-validation-error">The plan preview encountered an error. Please reload the page and try again.</p>';
   modal.hidden=false;
   document.body.classList.add("modal-open");
  }else{
   window.alert("The plan preview could not be opened. Please reload the page and try again.");
  }
 }
},true);
document.querySelectorAll("[data-close-modal]").forEach(element=>element.addEventListener("click",closePlan));
document.addEventListener("keydown",event=>{
 if(!modal||modal.hidden)return;
 if(event.key==="Escape"){closePlan();return;}
 if(event.key!=="Tab")return;
 const focusable=Array.from(modal.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(el=>el.getClientRects().length>0);
 if(!focusable.length){event.preventDefault();return;}
 const first=focusable[0],last=focusable[focusable.length-1];
 if(event.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
})();