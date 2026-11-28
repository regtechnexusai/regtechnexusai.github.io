import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const $ = (id) => document.getElementById(id);
const state = { supabase:null, session:null, organisation:null, invoices:[], mode:"login" };
const money = (n) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(n||0));
const safe = (v) => String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const message = (id,text,isError=true) => { $(id).textContent=text||""; $(id).style.color=isError?"#9b4b42":"#397552"; };
const today = () => new Date().toISOString().slice(0,10);
function status(row){if(Number(row.amount_paid)>=Number(row.amount))return "paid";if(row.due_date<today())return "overdue";const days=(new Date(row.due_date+"T00:00:00")-new Date(today()+"T00:00:00"))/86400000;return days<=7?"due":"open";}
function showAuth(){ $("authView").hidden=false;$("appView").hidden=true;$("signOutBtn").hidden=true;$("workspaceName").textContent="Secure workspace"; }
function showApp(){ $("authView").hidden=true;$("appView").hidden=false;$("signOutBtn").hidden=false;$("workspaceName").textContent=state.organisation?.name||"Organisation";$("welcomeTitle").textContent=state.organisation?.name||"Receivables"; }
async function initialise(){
 try{
  const response=await fetch("/api/config",{headers:{Accept:"application/json"},cache:"no-store"});
  if(!response.ok)throw new Error("Configuration endpoint is not available.");
  const cfg=await response.json();
  if(!cfg.supabaseUrl||!cfg.supabaseAnonKey)throw new Error("Supabase sandbox is not configured yet. Authentication is disabled until the project URL and public anon key are configured.");
  state.supabase=createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data:{session}}=await state.supabase.auth.getSession();state.session=session;
  state.supabase.auth.onAuthStateChange((_event,session)=>{state.session=session;if(session){void loadWorkspace();}else{state.organisation=null;state.invoices=[];showAuth();}});
  if(session)await loadWorkspace();else showAuth();
 }catch(error){$("setupNotice").hidden=false;message("authMessage",error.message);showAuth();}
}
async function loadWorkspace(){
 if(!state.session||!state.supabase)return;
 // Accept invitations created by the trusted server function, then resolve the tenant.
 const {error:inviteError}=await state.supabase.rpc("accept_my_pending_invitations");
 if(inviteError && !/function .* does not exist/i.test(inviteError.message)){message("authMessage",inviteError.message);showAuth();return;}
 let {data:org,error:orgError}=await state.supabase.rpc("get_my_organisation");
 if(orgError){message("authMessage",orgError.message);showAuth();return;}
 state.organisation=Array.isArray(org)?org[0]:org;
 // The first verified sign-in completes onboarding using the organisation name
 // supplied at registration. The database RPC assigns the authenticated user as owner.
 if(!state.organisation){
  const {data:{user}}=await state.supabase.auth.getUser();
  const orgName=String(user?.user_metadata?.organisation_name||"").trim();
  if(orgName){
   const {error:createError}=await state.supabase.rpc("create_my_organisation",{org_name:orgName});
   if(createError){message("authMessage",createError.message);showAuth();return;}
   const result=await state.supabase.rpc("get_my_organisation");
   if(result.error){message("authMessage",result.error.message);showAuth();return;}
   state.organisation=Array.isArray(result.data)?result.data[0]:result.data;
  }
 }
 if(!state.organisation){message("authMessage","No organisation membership was found. Ask your workspace administrator for an invitation.");showAuth();return;}
 showApp();await loadInvoices();
}
async function loadInvoices(){
 const {data,error}=await state.supabase.from("invoices").select("id,invoice_number,customer_name,issue_date,due_date,amount,amount_paid,follow_up_status,currency,created_at").order("due_date",{ascending:true});
 if(error){message("authMessage",error.message);return;}
 state.invoices=data||[];render();
}
function render(){
 const rows=state.invoices,open=rows.filter(x=>status(x)!=="paid"),overdue=open.filter(x=>status(x)==="overdue"),due=open.filter(x=>status(x)==="due"),sum=a=>a.reduce((s,x)=>s+Number(x.amount)-Number(x.amount_paid),0);
 $("stats").innerHTML=[["Outstanding AR",sum(open),"Open invoice balances"],["Overdue",sum(overdue),overdue.length+" overdue"],["Due in 7 days",sum(due),due.length+" coming due"],["Total invoices",rows.length,"Saved records"]].map(([l,v,s])=>'<div class="stat"><span>'+l+'</span><strong>'+ (l==="Total invoices"?v:money(v))+'</strong><small>'+s+'</small></div>').join("");
 const q=$("searchInput").value.toLowerCase(),filter=$("statusFilter").value;
 const filtered=rows.filter(x=>(x.invoice_number+" "+x.customer_name).toLowerCase().includes(q)&&(filter==="all"||status(x)===filter));
 $("invoiceRows").innerHTML=filtered.map(x=>'<tr><td><b>'+safe(x.invoice_number)+'</b></td><td>'+safe(x.customer_name)+'</td><td>'+safe(x.due_date)+'</td><td>'+money(x.amount)+'</td><td>'+money(x.amount_paid)+'</td><td><b>'+money(Number(x.amount)-Number(x.amount_paid))+'</b></td><td><span class="status '+status(x)+'">'+status(x).toUpperCase()+'</span></td><td><button class="button secondary" data-edit="'+safe(x.id)+'">Edit</button></td></tr>').join("");
 $("emptyState").hidden=filtered.length>0;
 document.querySelectorAll("[data-edit]").forEach(btn=>btn.addEventListener("click",()=>editInvoice(btn.dataset.edit)));
}
function setMode(mode){state.mode=mode;$("loginTab").classList.toggle("active",mode==="login");$("signupTab").classList.toggle("active",mode==="signup");$("signupFields").hidden=mode!=="signup";$("authSubmit").textContent=mode==="login"?"Sign in securely":"Create account";$("authForm").elements.password.autocomplete=mode==="login"?"current-password":"new-password";message("authMessage","",false);}
$("loginTab").onclick=()=>setMode("login");$("signupTab").onclick=()=>setMode("signup");
$("authForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!state.supabase){message("authMessage","Sandbox is not configured. No credentials have been accepted.");return;}
 const form=new FormData(e.currentTarget),email=String(form.get("email")).trim().toLowerCase(),password=String(form.get("password"));
 $("authSubmit").disabled=true;message("authMessage","Please wait…",false);
 try{
  if(state.mode==="signup"){
   const orgName=String(form.get("orgName")||"").trim();if(!orgName)throw new Error("Enter your organisation name.");
   const {data,error}=await state.supabase.auth.signUp({email,password,options:{data:{organisation_name:orgName}}});if(error)throw error;
   if(data.session){state.session=data.session;await loadWorkspace();}else message("authMessage","Account created. Verify your email, then sign in.",false);
  }else{const {data,error}=await state.supabase.auth.signInWithPassword({email,password});if(error)throw error;state.session=data.session;await loadWorkspace();}
 }catch(err){message("authMessage",err.message);}finally{$("authSubmit").disabled=false;}
});
$("resetPassword").onclick=async()=>{if(!state.supabase){message("authMessage","Sandbox is not configured.");return;}const email=$("authForm").elements.email.value.trim();if(!email){message("authMessage","Enter your email address first.");return;}const {error}=await state.supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});message("authMessage",error?.message||"Password reset email requested. Check your inbox.",!!error);};
$("signOutBtn").onclick=async()=>{if(state.supabase)await state.supabase.auth.signOut();};
const dialog=$("invoiceDialog");
$("addInvoiceBtn").onclick=()=>{const f=$("invoiceForm");f.reset();f.dataset.id="";f.elements.issue.value=today();const d=new Date();d.setDate(d.getDate()+14);f.elements.due.value=d.toISOString().slice(0,10);f.elements.paid.value="0";$("invoiceMessage").textContent="";dialog.showModal();};
$("closeDialog").onclick=$("cancelDialog").onclick=()=>dialog.close();
async function editInvoice(id){const row=state.invoices.find(x=>x.id===id);if(!row)return;const f=$("invoiceForm");f.dataset.id=row.id;f.elements.number.value=row.invoice_number;f.elements.customer.value=row.customer_name;f.elements.issue.value=row.issue_date;f.elements.due.value=row.due_date;f.elements.amount.value=row.amount;f.elements.paid.value=row.amount_paid;f.elements.follow.value=row.follow_up_status;dialog.showModal();}
$("invoiceForm").addEventListener("submit",async e=>{
 e.preventDefault();const f=e.currentTarget,d=new FormData(f),amount=Number(d.get("amount")),paid=Number(d.get("paid")),issue=String(d.get("issue")),due=String(d.get("due"));
 if(!Number.isFinite(amount)||!Number.isFinite(paid)||amount<=0||paid<0||paid>amount||issue>due){message("invoiceMessage","Check dates and amounts. Paid amount cannot exceed invoice amount.");return;}
 const payload={invoice_number:String(d.get("number")).trim(),customer_name:String(d.get("customer")).trim(),issue_date:issue,due_date:due,amount,amount_paid:paid,follow_up_status:String(d.get("follow")),currency:"USD"};
 const id=f.dataset.id;const result=id?await state.supabase.from("invoices").update(payload).eq("id",id):await state.supabase.from("invoices").insert(payload);
 if(result.error){message("invoiceMessage",result.error.message);return;}
 dialog.close();await loadInvoices();
});
$("searchInput").oninput=render;$("statusFilter").onchange=render;
$("exportBtn").onclick=()=>{const data=[["Invoice","Customer","Issue date","Due date","Amount","Paid","Balance","Follow-up"],...state.invoices.map(x=>[x.invoice_number,x.customer_name,x.issue_date,x.due_date,x.amount,x.amount_paid,Number(x.amount)-Number(x.amount_paid),x.follow_up_status])];const csv=data.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="finance-invoices.csv";a.click();URL.revokeObjectURL(url);};
void initialise();