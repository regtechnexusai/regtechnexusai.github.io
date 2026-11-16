/* AlfiQ 0.7 — local document extraction and synchronized source-pane review.
   PDF.js and Mammoth are self-hosted by the Pages build workflow. No file contents leave this browser. */
(function(){
 "use strict";
 const file=document.getElementById("file"),status=document.getElementById("fileStatus"),clear=document.getElementById("clearFile");
 if(!file||!status)return;
 const MAX_BYTES=10*1024*1024,MAX_PAGES=200,MAX_TEXT=2*1024*1024;
 let token=0,mammothPromise=null;
 function setStatus(message){status.textContent=message;}
 function targetField(){return document.getElementById(document.getElementById("fileTarget").value);}
 function applyText(text,label,warning){
  if(!text||!text.trim())throw new Error("No selectable text was extracted. This may be a scanned or image-only document; OCR is not included.");
  if(text.length>MAX_TEXT)throw new Error("Extracted text exceeds the 2 MB limit. Split the source document and retry.");
  const target=targetField();target.value=text;target.dispatchEvent(new Event("input",{bubbles:true}));
  setStatus(label+" extracted locally into the "+(target.id==="oldText"?"earlier":"revised")+" text pane."+(warning?" "+warning:"")+" Verify headings, tables, footnotes and paragraph order against the original.");
 }
 async function loadMammoth(){
  if(window.mammoth)return window.mammoth;
  if(!mammothPromise)mammothPromise=new Promise((resolve,reject)=>{
   const script=document.createElement("script");script.src="/alfiq/vendor/mammoth.browser.min.js";script.onload=()=>window.mammoth?resolve(window.mammoth):reject(new Error("DOCX extraction library did not initialise."));script.onerror=()=>reject(new Error("Self-hosted DOCX extraction library is unavailable. Refresh the page or contact support."));document.head.appendChild(script);
  });
  return mammothPromise;
 }
 function validateDocxArchive(bytes){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const start=Math.max(0,bytes.length-65557);let eocd=-1;
  for(let i=bytes.length-22;i>=start;i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break;}}
  if(eocd<0)throw new Error("DOCX ZIP directory is missing or malformed.");
  const entries=view.getUint16(eocd+10,true),directorySize=view.getUint32(eocd+12,true),directoryOffset=view.getUint32(eocd+16,true);
  if(entries===0xffff||directorySize===0xffffffff||directoryOffset===0xffffffff)throw new Error("ZIP64 DOCX archives are not supported by this browser intake.");
  if(entries>1000||directoryOffset+directorySize>bytes.length)throw new Error("DOCX archive structure exceeds the supported limits.");
  let offset=directoryOffset,total=0;
  for(let i=0;i<entries;i++){
   if(offset+46>bytes.length||view.getUint32(offset,true)!==0x02014b50)throw new Error("DOCX ZIP directory entry is invalid.");
   const flags=view.getUint16(offset+8,true),uncompressed=view.getUint32(offset+24,true);
   const nameLength=view.getUint16(offset+28,true),extraLength=view.getUint16(offset+30,true),commentLength=view.getUint16(offset+32,true);
   if(flags&1)throw new Error("Encrypted DOCX archives are not supported.");
   if(uncompressed===0xffffffff)throw new Error("ZIP64 DOCX entries are not supported.");
   total+=uncompressed;
   if(uncompressed>10*1024*1024||total>30*1024*1024)throw new Error("DOCX expands beyond the 30 MB safety limit.");
   offset+=46+nameLength+extraLength+commentLength;
  }
  if(offset>directoryOffset+directorySize)throw new Error("DOCX ZIP directory bounds are invalid.");
 }
 async function extractDocx(file,requestToken){
  if(file.size>MAX_BYTES)throw new Error("DOCX exceeds the 10 MB limit.");
  const bytes=new Uint8Array(await file.arrayBuffer());if(requestToken!==token)return;
  if(bytes[0]!==0x50||bytes[1]!==0x4b)throw new Error("The selected .docx file is not a valid Office Open XML ZIP document.");
  validateDocxArchive(bytes);
  const mammoth=await loadMammoth();if(requestToken!==token)return;
  const result=await mammoth.extractRawText({arrayBuffer:bytes.buffer});if(requestToken!==token)return;
  const warning=result.messages&&result.messages.length?"DOCX parser reported "+result.messages.length+" conversion note(s); check the original.":"";
  applyText(result.value,"DOCX text",warning);
 }
 async function extractPdf(file,requestToken){
  if(file.size>MAX_BYTES)throw new Error("PDF exceeds the 10 MB limit.");
  const bytes=new Uint8Array(await file.arrayBuffer());if(requestToken!==token)return;
  const header=new TextDecoder("latin1").decode(bytes.subarray(0,1024));
  if(header.indexOf("%PDF-")<0)throw new Error("The selected .pdf file does not contain a valid PDF header.");
  const pdfjs=await import("../vendor/pdf.mjs");if(requestToken!==token)return;
  pdfjs.GlobalWorkerOptions.workerSrc=new URL("../vendor/pdf.worker.mjs",import.meta.url).href;
  const loading=pdfjs.getDocument({data:bytes,isEvalSupported:false,enableXfa:false,useWorkerFetch:false});
  const pdf=await loading.promise;
  try{
   if(pdf.numPages>MAX_PAGES)throw new Error("PDF contains "+pdf.numPages+" pages. The maximum supported length is 200 pages.");
   const pages=[],emptyPages=[];let chars=0;
   for(let pageNo=1;pageNo<=pdf.numPages;pageNo++){
    if(requestToken!==token)return;
    const page=await pdf.getPage(pageNo),content=await page.getTextContent();
    const text=content.items.filter(item=>typeof item.str==="string"&&item.str.length).map(item=>item.str).join(" ").replace(/[ \t]+/g," ").trim();
    if(!text)emptyPages.push(pageNo);
    if(text){chars+=text.length;if(chars>MAX_TEXT)throw new Error("Extracted PDF text exceeds the 2 MB limit. Split the document and retry.");pages.push("[Page "+pageNo+"]\n"+text);}
    setStatus("Reading PDF locally: page "+pageNo+" of "+pdf.numPages+"…");
   }
   const extracted=pages.join("\n\n");
   if(!extracted.trim())throw new Error("No selectable text was found. This appears to be a scanned/image-only PDF; AlfiQ does not perform OCR.");
   const warning=emptyPages.length?"No selectable text on "+emptyPages.length+" page(s) ("+emptyPages.slice(0,12).join(", ")+(emptyPages.length>12?", …":"")+"); scanned pages require OCR.":"";
   applyText(extracted,"PDF text ("+pdf.numPages+" pages)",warning);
  }finally{await loading.destroy();}
 }
 file.addEventListener("change",async event=>{
  const selected=event.target.files&&event.target.files[0];if(!selected)return;
  const requestToken=++token,extension=(selected.name.split(".").pop()||"").toLowerCase();
  if(extension!=="pdf"&&extension!=="docx")return;
  try{
   if(selected.size>MAX_BYTES)throw new Error("File exceeds the 10 MB limit.");
   setStatus("Preparing local "+extension.toUpperCase()+" extraction…");
   if(extension==="pdf")await extractPdf(selected,requestToken);else await extractDocx(selected,requestToken);
  }catch(error){if(requestToken===token){setStatus("Document extraction stopped: "+(error&&error.message?error.message:"unknown error")+". Your existing text was not replaced.");}}
 });
 if(clear)clear.addEventListener("click",()=>{token++;});
 const reset=document.getElementById("reset");if(reset)reset.addEventListener("click",()=>{token++;const packInput=document.getElementById("rulePackFile"),packSelect=document.getElementById("builtInRulePack"),packStatus=document.getElementById("rulePackStatus");if(packInput)packInput.value="";if(packSelect){packSelect.value="general.json";packSelect.dispatchEvent(new Event("change",{bubbles:true}));}else if(packStatus){packStatus.textContent="Rule-pack selection cleared. General Compliance will be restored when the workspace reloads.";}});
 const oldPane=document.getElementById("oldText"),newPane=document.getElementById("newText"),sync=document.getElementById("syncScroll"),syncStatus=document.getElementById("syncStatus");
 if(oldPane&&newPane&&sync){
  let locked=false,frame=0;
  function syncFrom(source,target){
   if(!sync.checked||locked)return;
   if(frame)cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    const sourceMax=Math.max(1,source.scrollHeight-source.clientHeight),targetMax=Math.max(0,target.scrollHeight-target.clientHeight);
    const ratio=Math.min(1,Math.max(0,source.scrollTop/sourceMax));
    locked=true;target.scrollTop=ratio*targetMax;
    requestAnimationFrame(()=>{locked=false;frame=0;});
   });
  }
  oldPane.addEventListener("scroll",()=>syncFrom(oldPane,newPane),{passive:true});
  newPane.addEventListener("scroll",()=>syncFrom(newPane,oldPane),{passive:true});
  sync.addEventListener("change",()=>{syncStatus.textContent=sync.checked?"Synchronized scrolling is on. Scroll either pane to move the other proportionally.":"Synchronized scrolling is off.";});
 }
})();