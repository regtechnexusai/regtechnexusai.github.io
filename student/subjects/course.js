(() => {
const DATA={
"Mathematics":{icon:"📐",description:"A structured mathematics pathway from core concepts to guided practice.",topics:{
"Algebra":["An equation states that two expressions have the same value.","Start by identifying the unknown, simplify both sides, then isolate the variable.","Example: 3x+2=14 gives 3x=12 and x=4."],
"Functions":["A function maps each allowed input to exactly one output.","Identify domain, rule and range; then test inputs systematically.","Example: f(x)=2x+1 gives f(3)=7."],
"Calculus":["Calculus studies change and accumulation.","Differentiation describes instantaneous rate of change; integration describes accumulation.","A derivative can represent the slope of a curve."],
"Geometry":["Geometry studies shapes, sizes, angles and spatial relationships.","Draw the figure, identify known quantities and choose the relevant theorem or formula.","The area of a rectangle is length × width."]}},
"Statistics":{icon:"📊",description:"Learn how to summarize, interpret and reason from data.",topics:{
"Descriptive Statistics":["Descriptive statistics summarize observed data.","Mean, median, mode, range and standard deviation describe different features.","The median is the middle ordered observation."],
"Probability":["Probability quantifies uncertainty between 0 and 1.","Define the sample space and event before calculating.","For equally likely outcomes, P(A)=favourable outcomes/total outcomes."],
"Regression":["Regression models relationships between variables.","Check assumptions, residuals and context before interpreting a model.","Association in a regression model does not by itself establish causation."]}},
"Economics":{icon:"📈",description:"Build a foundation in economic concepts and evidence-based interpretation.",topics:{
"Supply & Demand":["Demand describes quantities consumers are willing and able to buy; supply describes quantities producers are willing and able to sell.","Separate movement along a curve from a shift of the curve.","A change in price generally causes movement along a demand curve, while other determinants can shift it."],
"Inflation":["Inflation is a sustained increase in the general price level.","Distinguish the price level, inflation rate and relative price changes.","Central-bank and fiscal responses depend on the cause and context of inflation."],
"GDP":["GDP measures the value of final goods and services produced within an economy over a period.","State the period, price basis and measurement concept when interpreting GDP.","Real GDP adjusts for price changes."]}},
"Accounting":{icon:"📚",description:"Develop accounting fundamentals through concepts, examples and application.",topics:{
"Accounting Equation":["The accounting equation links assets, liabilities and equity.","Use Assets = Liabilities + Equity as a consistency check.","An owner cash contribution increases both cash and equity."],
"Financial Statements":["Financial statements communicate financial position and performance.","Connect transactions to the statement they affect and the reporting period.","The balance sheet reports financial position at a point in time."]}},
"Finance":{icon:"💰",description:"Study core finance concepts with practical calculation and interpretation.",topics:{
"Time Value of Money":["A unit of money available now can have a different economic value from the same unit received later.","Interest rate, timing and compounding are core inputs.","Present value discounts future cash flows."],
"NPV":["Net present value compares the present value of future cash flows with an investment outlay.","Make the discount rate, cash-flow timing and assumptions explicit.","A positive NPV under stated assumptions means discounted inflows exceed the initial outlay."]}},
"Business Studies":{icon:"💼",description:"Understand how organizations create value, serve markets and operate.",topics:{
"Business Models":["A business model describes how an organization creates, delivers and captures value.","Map customers, value proposition, activities, resources and revenue logic.","A business model is different from a single marketing campaign."],
"Marketing":["Marketing connects an offering with customer needs and markets.","Define audience, need, proposition, channel and evidence of response.","Segmentation helps tailor an offering to distinct groups."]}},
"Computer Science":{icon:"💻",description:"Build foundational computing concepts and problem-solving skills.",topics:{
"Algorithms":["An algorithm is a defined procedure for solving a problem.","Specify inputs, outputs, steps and edge cases.","Complexity describes how resource requirements change with input size."],
"Databases":["Databases organize and retrieve structured information.","Understand entities, relationships, keys and query logic.","A primary key identifies records uniquely within a table."]}},
"Programming":{icon:"⌨️",description:"Learn programming fundamentals through structured concepts and practice.",topics:{
"Variables & Control Flow":["Variables store values and control flow determines which instructions execute and when.","Trace values through conditions and loops.","A loop should have a clear termination condition."],
"Functions":["Functions package reusable behavior behind a defined interface.","Identify parameters, return values, side effects and assumptions.","Small functions are easier to test and debug."]}},
"Information Technology":{icon:"🖥️",description:"Understand practical IT systems, networks and access concepts.",topics:{
"Networks":["Networks allow systems to communicate using agreed protocols.","Map devices, connections, addresses and services.","Reliability and security are separate concerns that both require controls."],
"Authentication":["Authentication establishes identity; authorization determines permitted actions.","Use the distinction when analyzing access controls.","Multi-factor authentication combines independent factors."]}},
"Data Science":{icon:"🧠",description:"Build practical data skills from preparation to model evaluation.",topics:{
"Data Cleaning":["Data cleaning addresses missing, inconsistent, duplicated or invalid data.","Record transformation rules so results remain reproducible.","Cleaning decisions can change analytical conclusions."],
"Model Evaluation":["Model evaluation estimates how a model performs on data not used for fitting.","Choose metrics that match the problem and inspect subgroup behavior.","A single overall metric can hide important failure modes."]}},
"Cybersecurity":{icon:"🔐",description:"Learn foundational cybersecurity objectives and cryptographic concepts.",topics:{
"CIA Triad":["Confidentiality, integrity and availability are three foundational security objectives.","Map each control to the risk it addresses.","Encryption can support confidentiality; backups can support availability."],
"Cryptography":["Cryptography uses mathematical techniques to protect information.","Distinguish encryption, hashing, keys and digital signatures.","A cryptographic system depends on correct key management as well as algorithms."]}},
"English & Communication":{icon:"🗣️",description:"Strengthen academic and professional communication through practice.",topics:{
"Academic Writing":["Academic writing makes a clear claim and supports it with relevant evidence.","Plan the argument before polishing sentences.","A topic sentence states the main focus of a paragraph."],
"Professional Email":["Professional email should make purpose, action and context easy to identify.","Use a concise subject, clear request and appropriate closing.","Proofread names, dates, attachments and recipients."]}},
"Research Methodology":{icon:"🔎",description:"Learn how to frame questions, review evidence and design research.",topics:{
"Research Questions":["A research question defines what the study seeks to understand or explain.","Make the question specific enough to investigate with available evidence.","The method should be capable of answering the question."],
"Literature Review":["A literature review synthesizes relevant research rather than merely listing sources.","Compare findings, methods, limitations and gaps.","Keep source details traceable while drafting."]}},
"General Science":{icon:"🔬",description:"Build scientific reasoning through evidence, testing and interpretation.",topics:{
"Scientific Method":["Scientific inquiry uses questions, evidence, testing and revision.","State a testable hypothesis and identify variables and controls.","Conclusions should reflect evidence and limitations."],
"Climate Science":["Climate describes long-term patterns; weather describes short-term conditions.","Separate observations, mechanisms and model projections.","Time scale and uncertainty matter when interpreting climate evidence."]}},
"Social Science":{icon:"🌍",description:"Explore systematic social research and careful interpretation of evidence.",topics:{
"Social Research":["Social research studies people, groups and institutions using systematic evidence.","Define the population, variables and method clearly.","Sampling choices affect how far findings can be generalized."],
"Correlation & Causation":["Correlation indicates association between variables; it does not by itself prove causation.","Consider alternative explanations, confounding and research design.","Causal claims require appropriate evidence and assumptions."]}}
};
const subject=document.body.dataset.subject, course=DATA[subject]; if(!course){document.body.innerHTML='<main style="padding:30px"><h1>Subject course unavailable</h1><p>Please return to the Student Knowledge Hub.</p></main>';return;}
const qs=s=>document.querySelector(s); const esc=s=>String(s).replace(/[&<>"]/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]||m;});
document.title=subject+" Course | Student Knowledge Hub | RegTech Nexus AI";
qs("#courseIcon").textContent=course.icon;qs("#courseTitle").textContent=subject;qs("#courseDescription").textContent=course.description;
const keys=Object.keys(course.topics), storage="studentCourse:"+subject, saved=JSON.parse(localStorage.getItem(storage)||"{}");
const syllabus=qs("#syllabus"); keys.forEach((t,i)=>{const b=document.createElement("button");b.className="topic-link";b.textContent=(i+1)+". "+t;b.onclick=()=>loadTopic(t);syllabus.appendChild(b);});
qs("#topicCount").textContent=keys.length+" topics";qs("#courseProgress").textContent=Object.keys(saved).length+" completed";
const cards=qs("#courseCards");keys.forEach((t,i)=>{const d=course.topics[t],a=document.createElement("article");a.className="course-card";a.innerHTML='<h3>'+esc(t)+'</h3><p>'+esc(d[0])+'</p><button class="btn primary" type="button">Start study →</button>';a.querySelector("button").onclick=()=>loadTopic(t);cards.appendChild(a);});
function loadTopic(t){const d=course.topics[t];document.querySelectorAll(".topic-link").forEach(b=>b.classList.toggle("active",b.textContent.endsWith(t)));qs("#lessonTitle").textContent=t;qs("#concept").textContent=d[0];qs("#method").textContent=d[1];qs("#example").textContent=d[2];qs("#lessonStatus").textContent=saved[t]?"Completed on this device":"Not completed yet";qs("#lesson").scrollIntoView({behavior:"smooth",block:"start"});qs("#quiz").hidden=true;}
qs("#complete").onclick=()=>{const t=qs("#lessonTitle").textContent;if(!course.topics[t])return;saved[t]=new Date().toISOString();localStorage.setItem(storage,JSON.stringify(saved));qs("#lessonStatus").textContent="Completed on this device";qs("#courseProgress").textContent=Object.keys(saved).length+" completed";};
qs("#practice").onclick=()=>{const t=qs("#lessonTitle").textContent,d=course.topics[t];qs("#quizQuestion").textContent="Which statement is the best match for "+t+"?";const opts=[d[0],d[1],d[2],"The topic should always be applied without context or verification."];const shuffled=opts.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);const box=qs("#quizOptions");box.innerHTML="";shuffled.forEach(o=>{const l=document.createElement("label");l.innerHTML='<input type="radio" name="courseq" value="'+encodeURIComponent(o)+'"> '+esc(o);box.appendChild(l);});qs("#quiz").hidden=false;});
qs("#checkQuiz").onclick=()=>{const t=qs("#lessonTitle").textContent,d=course.topics[t],v=document.querySelector('input[name="courseq"]:checked');if(!v){qs("#result").textContent="Select an answer first.";return;}qs("#result").textContent=decodeURIComponent(v.value)===d[0]?"Correct. Review the concept, then continue to the next topic.":"Review the lesson: the first statement is the core concept for this topic.";};
loadTopic(keys[0]);
})();

/* Architecture-standard learning UX enhancements */
(function(){
  const q=s=>document.querySelector(s);
  const path=q('.learning-path');
  if(path){
    const subject=document.body.dataset.subject||'Subject';
    const steps=[
      ['01 · LEARN','Build the concept','Read the guided lesson and identify the core idea.'],
      ['02 · PRACTICE','Apply it','Use the worked example and practice the topic.'],
      ['03 · SELF-CHECK','Test yourself','Complete the quick practice and review feedback.'],
      ['04 · EVIDENCE','Document learning','Mark completion and keep your study record on this device.']
    ];
    path.innerHTML='<div class="learning-path-grid">'+steps.map(x=>'<div class="learning-step"><b>'+x[0]+'</b><strong>'+x[1]+'</strong><span>'+x[2]+'</span></div>').join('')+'</div>';
  }
  const topic=()=>q('#lessonTitle')?.textContent||document.body.dataset.subject||'Subject';
  const printBtn=document.createElement('button');
  printBtn.className='btn secondary';printBtn.type='button';printBtn.textContent='Print / Save as PDF';
  printBtn.onclick=()=>{const title=document.title;const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v||'—'};set('printTopic',topic());set('printConcept',q('#concept')?.textContent);set('printMethod',q('#method')?.textContent);set('printExample',q('#example')?.textContent);document.title='RegTech Nexus AI — '+(document.body.dataset.subject||'Study')+' — '+topic();window.print();setTimeout(()=>document.title=title,900);};
  q('.actions')?.appendChild(printBtn);
  q('#lesson')?.setAttribute('aria-live','polite');
  document.querySelectorAll('.topic-link').forEach(b=>b.setAttribute('aria-label','Study '+b.textContent.trim()));
})();
