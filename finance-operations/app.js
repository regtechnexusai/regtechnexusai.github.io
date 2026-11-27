const initial = [
  {id:1,number:"INV-1001",customer:"Northstar Supplies",issue:"2026-10-18",due:"2026-10-28",amount:4200,paid:0,follow:"Email sent"},
  {id:2,number:"INV-1002",customer:"Blue River Trading",issue:"2026-10-22",due:"2026-11-03",amount:6800,paid:2500,follow:"Call scheduled"},
  {id:3,number:"INV-1003",customer:"Delta Office Ltd.",issue:"2026-10-30",due:"2026-11-10",amount:3150,paid:0,follow:"Not contacted"},
  {id:4,number:"INV-1004",customer:"Cedar Works",issue:"2026-11-04",due:"2026-11-15",amount:5400,paid:1200,follow:"Promise to pay"},
  {id:5,number:"INV-1005",customer:"Summit Services",issue:"2026-11-06",due:"2026-11-19",amount:8900,paid:0,follow:"Disputed"},
  {id:6,number:"INV-1006",customer:"Harbor Logistics",issue:"2026-11-11",due:"2026-11-25",amount:2650,paid:0,follow:"Not contacted"},
  {id:7,number:"INV-1007",customer:"Evergreen Retail",issue:"2026-11-12",due:"2026-11-30",amount:3800,paid:0,follow:"Email sent"}
];
const followOptions = ["Not contacted","Email sent","Call scheduled","Promise to pay","Disputed"];
let invoices = structuredClone(initial);
const today = new Date(); today.setHours(0,0,0,0);
const fmt = n => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n);
const cents = n => Math.round((Number(n)+Number.EPSILON)*100)/100;
const balance = i => cents(Math.max(0,i.amount-i.paid));
function getStatus(i){
  if(balance(i)<=0) return "paid";
  const due = new Date(i.due+"T00:00:00");
  const delta = Math.floor((due-today)/86400000);
  return delta<0 ? "overdue" : delta<=7 ? "due" : "open";
}
function age(i){
  if(getStatus(i)==="paid") return "—";
  return Math.max(0,Math.floor((today-new Date(i.issue+"T00:00:00"))/86400000))+" d";
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function render(){
  const open=invoices.filter(i=>balance(i)>0), out=open.reduce((s,i)=>s+balance(i),0);
  const overdue=open.filter(i=>getStatus(i)==="overdue"), due=open.filter(i=>getStatus(i)==="due");
  document.getElementById("stats").innerHTML=[
    ["Outstanding AR",fmt(out),"Remaining balance on open invoices"],
    ["Overdue",fmt(overdue.reduce((s,i)=>s+balance(i),0)),overdue.length+" invoice(s) overdue"],
    ["Due in 7 days",fmt(due.reduce((s,i)=>s+balance(i),0)),due.length+" invoice(s) coming due"],
    ["Total invoices",invoices.length,"Demo session only"]
  ].map(([label,value,sub])=>'<div class="stat"><div class="label">'+label+'</div><div class="value">'+value+'</div><div class="sub">'+sub+'</div></div>').join("");
  const q=document.getElementById("searchInput").value.toLowerCase(), f=document.getElementById("statusFilter").value;
  const filtered=invoices.filter(i=>(i.number+" "+i.customer).toLowerCase().includes(q)&&(f==="all"||(f==="overdue"&&getStatus(i)==="overdue")||(f==="due"&&getStatus(i)==="due")||(f==="paid"&&getStatus(i)==="paid")));
  document.getElementById("invoiceRows").innerHTML=filtered.map(i=>{
    const st=getStatus(i);
    return '<tr><td><strong>'+escapeHtml(i.number)+'</strong></td><td>'+escapeHtml(i.customer)+'</td><td>'+escapeHtml(i.due)+'</td><td>'+age(i)+'</td><td class="amount">'+fmt(i.amount)+'</td><td class="amount">'+fmt(balance(i))+'</td><td><span class="status '+(st==="open"?"due":st)+'">'+(st==="open"?"Open":st[0].toUpperCase()+st.slice(1))+'</span></td><td><select class="follow" data-follow="'+i.id+'">'+followOptions.map(x=>'<option '+(x===i.follow?"selected":"")+'>'+escapeHtml(x)+'</option>').join("")+'</select></td><td><button class="delete" data-delete="'+i.id+'" aria-label="Delete '+escapeHtml(i.number)+'">×</button></td></tr>';
  }).join("");
  document.getElementById("emptyState").hidden=filtered.length>0;
  document.querySelectorAll("[data-follow]").forEach(e=>e.onchange=()=>{
    const inv=invoices.find(x=>x.id===Number(e.dataset.follow)); if(inv && followOptions.includes(e.value)) inv.follow=e.value;
  });
  document.querySelectorAll("[data-delete]").forEach(e=>e.onclick=()=>{
    invoices=invoices.filter(x=>x.id!==Number(e.dataset.delete)); render();
  });
}
document.getElementById("searchInput").oninput=render;
document.getElementById("statusFilter").onchange=render;
const dlg=document.getElementById("invoiceDialog");
document.getElementById("addInvoiceBtn").onclick=()=>{
  const form=document.getElementById("invoiceForm");
  form.reset();
  const nextNumber=()=>{
    let n=1008;
    while(invoices.some(i=>i.number.toLowerCase()===("INV-"+n).toLowerCase())) n++;
    return "INV-"+n;
  };
  const localDate=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  const issueDate=new Date();
  issueDate.setHours(0,0,0,0);
  const dueDate=new Date(issueDate);
  dueDate.setDate(dueDate.getDate()+14);
  form.elements.number.value=nextNumber();
  form.elements.customer.value="Sample Customer Ltd.";
  form.elements.issue.value=localDate(issueDate);
  form.elements.due.value=localDate(dueDate);
  form.elements.amount.value="2500.00";
  form.elements.paid.value="500.00";
  form.elements.follow.value="Email sent";
  dlg.showModal();
};
document.getElementById("closeDialog").onclick=()=>dlg.close();
document.getElementById("cancelDialog").onclick=()=>dlg.close();
document.getElementById("invoiceForm").onsubmit=e=>{
  e.preventDefault();
  const d=new FormData(e.target), number=String(d.get("number")||"").trim(), customer=String(d.get("customer")||"").trim();
  const issue=String(d.get("issue")||""), due=String(d.get("due")||"");
  const amount=Number(d.get("amount")), paid=Number(d.get("paid")||0);
  const issueDate=new Date(issue+"T00:00:00"), dueDate=new Date(due+"T00:00:00");
  const validDate=x=>x instanceof Date && !Number.isNaN(x.getTime());
  if(!number || !customer){alert("Enter an invoice number and customer name.");return;}
  if(invoices.some(i=>i.number.toLowerCase()===number.toLowerCase())){alert("Invoice number already exists in this demo.");return;}
  if(!validDate(issueDate)||!validDate(dueDate)||issueDate>dueDate){alert("Enter valid dates. Issue date must be on or before the due date.");return;}
  if(!Number.isFinite(amount)||!Number.isFinite(paid)||amount<=0||paid<0||paid>amount){alert("Amounts must be valid: invoice amount must be above zero and paid amount cannot exceed invoice amount.");return;}
  if(!followOptions.includes(d.get("follow"))){alert("Select a valid follow-up status.");return;}
  invoices.push({id:Date.now(),number,customer,issue,due,amount:cents(amount),paid:cents(paid),follow:d.get("follow")});
  dlg.close();render();
};
document.getElementById("resetBtn").onclick=()=>{invoices=structuredClone(initial);render();};
document.getElementById("exportBtn").onclick=()=>{
  const rows=[["Invoice","Customer","Issue date","Due date","Amount","Paid","Outstanding","Follow-up"],...invoices.map(i=>[i.number,i.customer,i.issue,i.due,i.amount,i.paid,balance(i),i.follow])];
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}), url=URL.createObjectURL(blob), a=document.createElement("a");
  a.href=url;a.download="finance-demo-invoices.csv";a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
};
render();
