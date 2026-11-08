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
function openPlan(plan){if(billingMode!=="DEMO"||!modal||!modalPlan)return;modalPlan.textContent=plan+" — preview only";modal.hidden=false;const close=modal.querySelector(".modal-close");if(close)close.focus();}
function closePlan(){if(modal)modal.hidden=true;}
document.querySelectorAll("[data-plan]").forEach(button=>button.addEventListener("click",()=>openPlan(button.getAttribute("data-plan")||"Selected plan")));
document.querySelectorAll("[data-close-modal]").forEach(element=>element.addEventListener("click",closePlan));
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&modal&&!modal.hidden)closePlan();});
})();