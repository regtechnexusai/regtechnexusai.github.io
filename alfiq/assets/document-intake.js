/* AlfiQ 0.8 — independent local document intake for both comparison versions.
   PDF.js and Mammoth are self-hosted. No document content leaves this browser. */
(function(){
 "use strict";
 const MAX_BYTES=10*1024*1024,MAX_PAGES=200,MAX_TEXT=2*1024*1024;
 const sides=[
  {input:"earlierFile",target:"oldText",status:"earlierFileStatus",preview:"earlierPreview",previewText:"earlierPreviewText",clear:"clearEarlierFile",label:"Earlier / existing"},
  {input:"revisedFile",target:"newText",status:"revisedFileStatus",preview:"revisedPreview",previewText:"revisedPreviewText",clear:"clearRevisedFile",label:"New / revised"}
 ];
 const tokens=Object.create(null);let mammothPromise=null;
 const $=id=>document.getElementById(id);
 function setStatus(side,message){$(side.status).textContent=message;}
 function invalidate(){if(typeof window.AlfiQInvalidateAnalysis==="function")window.AlfiQInvalidateAnalysis();}
 function updateAnalyse(){const button=$("analyse");if(button)button.disabled=!(($("oldText").value||"").trim()&&($("newText").value||"").trim());}
 ["oldText","newText"].forEach(id=>$(id).addEventListener("input",updateAnalyse));
 function applyText(side,file,text,label,warning){
  if(!text||!text.trim())throw new Error("No selectable text was extracted. This may be a scanned or image-only document; OCR is not included.");
  if(text.length>MAX_TEXT)throw new Error("Extracted text exceeds the 2 MB limit. Split the source document and retry.");
  const target=$(side.target);target.value=text;target.dispatchEvent(new Event("input",{bubbles:true}));
  $(side.previewText).textContent=text;$(side.preview).hidden=false;
  setStatus(side,"Selected: "+file.name+" · "+(file.size/1024).toFixed(1)+" KB · "+label+" extracted locally into its matching text field."+(warning?" "+warning:"")+" Verify headings, tables, footnotes and paragraph order against the original.");
  updateAnalyse();invalidate();
 }
 async function loadMammoth(){
  if(window.mammoth)return window.mammoth;
  if(!mammothPromise)mammothPromise=new Promise((resolve,reject)=>{
   const script=document.createElement("script");script.src="/alfiq/vendor/mammoth.browser.min.js";script.onload=()=>window.mammoth?resolve(window.mammoth):reject(new Error("DOCX extraction library did not initialise."));script.onerror=()=>reject(new Error("Self-hosted DOCX extraction library is unavailable. Refresh the page or contact support."));document.head.appendChild(script);
  });
  return mammothPromise;
 }
 function validateDocxArchive(bytes){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),start=Math.max(0,bytes.length-65557);let eocd=-1;
  for(let i=bytes.length-22;i>=start;i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break;}}
  if(eocd<0)throw new Error("DOCX ZIP directory is missing or malformed.");
  const entries=view.getUint16(eocd+10,true),directorySize=view.getUint32(eocd+12,true),directoryOffset=view.getUint32(eocd+16,true);
  if(entries===0xffff||directorySize===0xffffffff||directoryOffset===0xffffffff)throw new Error("ZIP64 DOCX archives are not supported.");
  if(entries>1000||directoryOffset+directorySize>bytes.length)throw new Error("DOCX archive structure exceeds the supported limits.");
  let offset=directoryOffset,total=0;
  for(let i=0;i<entries;i++){
   if(offset+46>bytes.length||view.getUint32(offset,true)!==0x02014b50)throw new Error("DOCX ZIP directory entry is invalid.");
   const flags=view.getUint16(offset+8,true),uncompressed=view.getUint32(offset+24,true),nameLength=view.getUint16(offset+28,true),extraLength=view.getUint16(offset+30,true),commentLength=view.getUint16(offset+32,true);
   if(flags&1)throw new Error("Encrypted DOCX archives are not supported.");
   if(uncompressed===0xffffffff)throw new Error("ZIP64 DOCX entries are not supported.");
   total+=uncompressed;if(uncompressed>10*1024*1024||total>30*1024*1024)throw new Error("DOCX expands beyond the 30 MB safety limit.");
   offset+=46+nameLength+extraLength+commentLength;
  }
  if(offset>directoryOffset+directorySize)throw new Error("DOCX ZIP directory bounds are invalid.");
 }
 async function extractText(file,side,token){
  if(file.size>2*1024*1024)throw new Error("Text/CSV/Markdown file exceeds the 2 MB limit.");
  const bytes=await file.arrayBuffer();if(tokens[side.input]!==token)return;
  const view=new Uint8Array(bytes);if(view.some(b=>b===0))throw new Error("Selected file contains binary data; choose a UTF-8 text file.");
  let value;try{value=new TextDecoder("utf-8",{fatal:true}).decode(bytes);}catch(e){throw new Error("File is not valid UTF-8 text. Save it as UTF-8 and retry.");}
  if(value.length>MAX_TEXT)throw new Error("Text exceeds the 2 MB extraction limit.");
  applyText(side,file,value,"Text", "");
 }
 async function extractDocx(file,side,token){
  if(file.size>MAX_BYTES)throw new Error("DOCX exceeds the 10 MB limit.");
  const bytes=new Uint8Array(await file.arrayBuffer());if(tokens[side.input]!==token)return;
  if(bytes[0]!==0x50||bytes[1]!==0x4b)throw new Error("Selected .docx is not a valid Office Open XML ZIP document.");
  validateDocxArchive(bytes);const mammoth=await loadMammoth();if(tokens[side.input]!==token)return;
  const result=await mammoth.extractRawText({arrayBuffer:bytes.buffer});if(tokens[side.input]!==token)return;
  const warning=result.messages&&result.messages.length?"DOCX parser reported "+result.messages.length+" conversion note(s); check the original.":"";
  applyText(side,file,result.value,"DOCX text",warning);
 }
 async function extractPdf(file,side,token){
  if(file.size>MAX_BYTES)throw new Error("PDF exceeds the 10 MB limit.");
  const bytes=new Uint8Array(await file.arrayBuffer());if(tokens[side.input]!==token)return;
  const header=new TextDecoder("latin1").decode(bytes.subarray(0,1024));if(header.indexOf("%PDF-")<0)throw new Error("Selected .pdf does not contain a valid PDF header.");
  const pdfjs=await import("../vendor/pdf.mjs");if(tokens[side.input]!==token)return;
  pdfjs.GlobalWorkerOptions.workerSrc=new URL("../vendor/pdf.worker.mjs",import.meta.url).href;
  const loading=pdfjs.getDocument({data:bytes,isEvalSupported:false,enableXfa:false,useWorkerFetch:false}),pdf=await loading.promise;
  try{
   if(pdf.numPages>MAX_PAGES)throw new Error("PDF contains "+pdf.numPages+" pages. Maximum supported length is 200 pages.");
   const pages=[],empty=[];let chars=0;
   for(let n=1;n<=pdf.numPages;n++){
    if(tokens[side.input]!==token)return;
    const page=await pdf.getPage(n),content=await page.getTextContent();
    const text=content.items.filter(item=>typeof item.str==="string"&&item.str.length).map(item=>item.str).join(" ").replace(/[ \t]+/g," ").trim();
    if(!text)empty.push(n);if(text){chars+=text.length;if(chars>MAX_TEXT)throw new Error("Extracted PDF text exceeds 2 MB. Split the document and retry.");pages.push("[Page "+n+"]\n"+text);}
    setStatus(side,"Reading PDF locally: page "+n+" of "+pdf.numPages+"…");
   }
   const extracted=pages.join("\n\n");if(!extracted.trim())throw new Error("No selectable text found. This appears to be a scanned/image-only PDF; AlfiQ does not perform OCR.");
   const warning=empty.length?"No selectable text on "+empty.length+" page(s) ("+empty.slice(0,12).join(", ")+(empty.length>12?", …":"")+"); scanned pages require OCR.":"";
   applyText(side,file,extracted,"PDF text ("+pdf.numPages+" pages)",warning);
  }finally{await loading.destroy();}
 }
 sides.forEach(side=>{
  const input=$(side.input);if(!input)return;
  input.addEventListener("change",async event=>{
   const file=event.target.files&&event.target.files[0];if(!file)return;
   const token=(tokens[side.input]||0)+1;tokens[side.input]=token;
   const ext=(file.name.split(".").pop()||"").toLowerCase();
   if(!["txt","md","csv","pdf","docx"].includes(ext)){input.value="";setStatus(side,"Unsupported type. Select .txt, .md, .csv, .pdf or .docx.");return;}
   if(!file.size){input.value="";setStatus(side,"Selected file is empty.");return;}
   try{
    setStatus(side,"Preparing local "+ext.toUpperCase()+" extraction…");
    if(ext==="pdf")await extractPdf(file,side,token);
    else if(ext==="docx")await extractDocx(file,side,token);
    else await extractText(file,side,token);
   }catch(error){if(tokens[side.input]===token)setStatus(side,"Document extraction stopped: "+(error&&error.message?error.message:"unknown error")+". Existing text was not replaced.");}
  });
  $(side.clear).addEventListener("click",()=>{
   tokens[side.input]=(tokens[side.input]||0)+1;input.value="";$(side.target).value="";$(side.target).dispatchEvent(new Event("input",{bubbles:true}));
   $(side.preview).hidden=true;$(side.previewText).textContent="";setStatus(side,side.label+" file cleared. Choose another file or paste text.");updateAnalyse();invalidate();
  });
 });
 const reset=$("reset");if(reset)reset.addEventListener("click",()=>{
  sides.forEach(side=>{tokens[side.input]=(tokens[side.input]||0)+1;$(side.input).value="";$(side.preview).hidden=true;$(side.previewText).textContent="";setStatus(side,"No document selected.");});
  const packInput=$("rulePackFile"),packSelect=$("builtInRulePack"),packStatus=$("rulePackStatus");if(packInput)packInput.value="";
  if(packSelect){packSelect.value="general.json";packSelect.dispatchEvent(new Event("change",{bubbles:true}));}else if(packStatus)packStatus.textContent="General Compliance rules will be restored when the workspace reloads.";updateAnalyse();
 });
 const oldPane=$("oldText"),newPane=$("newText"),sync=$("syncScroll"),syncStatus=$("syncStatus");
 if(oldPane&&newPane&&sync){
  let locked=false,frame=0;
  function syncFrom(source,target){if(!sync.checked||locked)return;if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   const sourceMax=Math.max(1,source.scrollHeight-source.clientHeight),targetMax=Math.max(0,target.scrollHeight-target.clientHeight),ratio=Math.min(1,Math.max(0,source.scrollTop/sourceMax));
   locked=true;target.scrollTop=ratio*targetMax;requestAnimationFrame(()=>{locked=false;frame=0;});
  });}
  oldPane.addEventListener("scroll",()=>syncFrom(oldPane,newPane),{passive:true});newPane.addEventListener("scroll",()=>syncFrom(newPane,oldPane),{passive:true});
  sync.addEventListener("change",()=>{syncStatus.textContent=sync.checked?"Synchronized scrolling is on. Scroll either pane to move the other proportionally.":"Synchronized scrolling is off.";});
 }
 updateAnalyse();
})();