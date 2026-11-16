/* One-time, same-origin AlfiQ summary receiver. No source document text is accepted. */
(function(){
 "use strict";
 var params=new URLSearchParams(location.search);
 var id=params.get("alfiq_handoff");
 if(!id||!/^[0-9a-f-]{36}$/i.test(id))return;
 var key="regtechnexusai.alfiq.handoff."+id;
 try{
  var raw=localStorage.getItem(key);
  localStorage.removeItem(key);
  if(!raw)return;
  var payload=JSON.parse(raw);
  if(payload.schemaVersion!=="1.0"||payload.origin!=="alfiq"||Date.now()>payload.expiresAt)return;
  var summary=payload.summary||{};
  var panel=document.createElement("section");
  panel.className="reggap-notice-wrap";
  panel.setAttribute("aria-labelledby","alfiq-handoff-title");
  var card=document.createElement("div");
  card.className="reggap-notice";
  var heading=document.createElement("strong");
  heading.id="alfiq-handoff-title";
  heading.textContent="Approved AlfiQ review summary received";
  var detail=document.createElement("p");
  detail.textContent="Reviewer: "+(summary.reviewer||"Not supplied")+" ("+(summary.reviewerRole||"Not supplied")+") · Review timestamp: "+(summary.reviewedAt||"Not supplied")+" · Rule pack: "+(summary.rulePack||"Not supplied")+".";
  var counts=document.createElement("p");
  counts.textContent="Added paragraphs: "+(summary.addedParagraphs||0)+" · Removed paragraphs: "+(summary.removedParagraphs||0)+" · Potential signals: "+(summary.potentialSignals||0)+".";
  var boundary=document.createElement("p");
  boundary.textContent=payload.boundary||"Summary only. Original regulatory source text was not transferred.";
  var notes=document.createElement("label");
  notes.textContent="AlfiQ approved notes (context only; not analysed as policy)";
  notes.style.display="block";
  var textarea=document.createElement("textarea");
  textarea.rows=5;
  textarea.readOnly=true;
  textarea.style.width="100%";
  textarea.value=[
   summary.title||"Approved AlfiQ review",
   "Reviewer: "+(summary.reviewer||"Not supplied"),
   "Role: "+(summary.reviewerRole||"Not supplied"),
   "Reviewed at: "+(summary.reviewedAt||"Not supplied"),
   "Rule pack: "+(summary.rulePack||"Not supplied"),
   "Added paragraphs: "+(summary.addedParagraphs||0),
   "Removed paragraphs: "+(summary.removedParagraphs||0),
   "Potential signals: "+(summary.potentialSignals||0),
   "Clause triage: "+(summary.triage||[]).map(function(x){return "Clause "+(x.clauseIndex+1)+": "+x.status;}).join("; "),
   payload.boundary||"Summary only."
  ].join("\n");
  card.appendChild(heading);card.appendChild(detail);card.appendChild(counts);card.appendChild(boundary);card.appendChild(notes);card.appendChild(textarea);panel.appendChild(card);
  var main=document.querySelector("#analyzer");
  if(main)main.parentNode.insertBefore(panel,main);
  params.delete("alfiq_handoff");
  history.replaceState(null,"",location.pathname+(params.toString()?"?"+params.toString():"")+location.hash);
 }catch(error){console.warn("AlfiQ handoff rejected:",error);}
})();
