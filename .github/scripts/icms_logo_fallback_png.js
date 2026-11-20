#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),os=require("node:os"),sharp=require("sharp");
const SOURCE_REL="regtech-nexus-ai-logo-2026.png",OUTPUT_REL="regtech-nexus-ai-logo-460.png";
const SOURCE_SHA256="ee4ec2520c4727461ce18da178219fa61ec733bb552c80808d0b2a75a3f9a5f4";
const SOURCE_WIDTH=1391,SOURCE_HEIGHT=476,OUTPUT_WIDTH=460,OUTPUT_HEIGHT=157,MAX_BYTES=120000;
const PAGE_REL="icms-2026/index.html";
const WEBP_SOURCE='<source srcset="../regtech-nexus-ai-logo-2026.webp" type="image/webp">';
const HEADER_OLD='<img class="brand-logo" src="../regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="160" height="55">';
const HEADER_NEW='<img class="brand-logo" src="../regtech-nexus-ai-logo-460.png" alt="RegTech Nexus AI" width="160" height="55">';
const FOOTER_OLD='<img class="brand-logo" src="../regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="248" height="80" loading="lazy" decoding="async">';
const FOOTER_NEW='<img class="brand-logo" src="../regtech-nexus-ai-logo-460.png" alt="RegTech Nexus AI" width="248" height="80" loading="lazy" decoding="async">';
function count(text,needle){return text.split(needle).length-1;}
function transformHtml(html){
 if(count(html,WEBP_SOURCE)!==2)throw new Error("Expected exactly two ICMS WebP picture sources");
 const ho=count(html,HEADER_OLD),fo=count(html,FOOTER_OLD),hn=count(html,HEADER_NEW),fn=count(html,FOOTER_NEW);
 if(ho===0&&fo===0&&hn===1&&fn===1)return html;
 if(ho!==1||fo!==1||hn!==0||fn!==0)throw new Error("ICMS fallback markup is unexpected or partially transformed; refusing rewrite");
 const updated=html.replace(HEADER_OLD,HEADER_NEW).replace(FOOTER_OLD,FOOTER_NEW);
 if(count(updated,HEADER_NEW)!==1||count(updated,FOOTER_NEW)!==1||count(updated,HEADER_OLD)!==0||count(updated,FOOTER_OLD)!==0)throw new Error("ICMS fallback rewrite count verification failed");
 return updated;
}
async function generateFallback(source,output,expectedHash=SOURCE_SHA256){
 const meta=await sharp(source).metadata();if(meta.format!=="png"||meta.width!==SOURCE_WIDTH||meta.height!==SOURCE_HEIGHT)throw new Error("Unexpected logo source PNG format/dimensions");
 const hash=crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex");if(hash!==expectedHash)throw new Error("Pinned source logo SHA-256 mismatch: "+hash);
 const temp=output+".tmp.png";try{await sharp(source).resize({width:OUTPUT_WIDTH,withoutEnlargement:true}).png({compressionLevel:9,adaptiveFiltering:true}).toFile(temp);const outMeta=await sharp(temp).metadata(),bytes=fs.statSync(temp).size;if(outMeta.format!=="png"||outMeta.width!==OUTPUT_WIDTH||outMeta.height!==OUTPUT_HEIGHT||bytes>MAX_BYTES)throw new Error("ICMS fallback PNG failed dimension/format/120KB gate: "+JSON.stringify({outMeta,bytes}));fs.renameSync(temp,output);return{bytes,metadata:outMeta};}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
}
async function build(siteDir){const root=path.resolve(siteDir),source=path.join(root,SOURCE_REL),output=path.join(root,OUTPUT_REL),page=path.join(root,PAGE_REL);if(!fs.existsSync(source)||!fs.statSync(source).isFile())throw new Error("Pinned logo PNG source missing");if(!fs.existsSync(page)||!fs.statSync(page).isFile())throw new Error("ICMS target page missing");const original=fs.readFileSync(page,"utf8"),updated=transformHtml(original);if(transformHtml(updated)!==updated)throw new Error("ICMS fallback transform is not idempotent");const result=await generateFallback(source,output);if(updated!==original)fs.writeFileSync(page,updated,"utf8");console.log("PASS: ICMS fallback PNG "+result.bytes+" bytes ("+((1-result.bytes/fs.statSync(source).size)*100).toFixed(2)+"% smaller); source retained");console.log("PASS: exactly two ICMS picture fallback tags changed; WebP source, alt, class, explicit dimensions, lazy loading and metadata preserved");}
async function selfTest(){
 const fixture='<head><meta property="og:image" content="https://regtechnexusai.com/regtech-nexus-ai-logo-2026.png"><meta name="twitter:image" content="https://regtechnexusai.com/regtech-nexus-ai-logo-2026.png"></head><picture>'+WEBP_SOURCE+HEADER_OLD+'</picture><picture>'+WEBP_SOURCE+FOOTER_OLD+'</picture>';
 const updated=transformHtml(fixture);if(count(updated,HEADER_NEW)!==1||count(updated,FOOTER_NEW)!==1||count(updated,'https://regtechnexusai.com/regtech-nexus-ai-logo-2026.png')!==2)throw new Error("Synthetic fallback replacement or metadata preservation failed");if(transformHtml(updated)!==updated)throw new Error("Transform idempotency failed");
 const firstImg='<img class="brand-logo" src="../regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="160" height="55">';
 for(const bad of [fixture.replace(firstImg,firstImg.replace("regtech-nexus-ai-logo-2026.png","other.png")),fixture.replace(firstImg,HEADER_NEW)]){try{transformHtml(bad);}catch{continue;}throw new Error("Fail-closed test did not reject mixed/malformed fallbacks");}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"icms-logo-fallback-test-"));try{const src=path.join(dir,SOURCE_REL),a=path.join(dir,"a.png"),b=path.join(dir,"b.png"),svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1391" height="476" viewBox="0 0 1391 476"><rect width="100%" height="100%" fill="white"/><text x="40" y="250" font-size="120" fill="#003366">Synthetic logo</text></svg>');await sharp(svg).png().toFile(src);const hash=crypto.createHash("sha256").update(fs.readFileSync(src)).digest("hex"),r1=await generateFallback(src,a,hash),r2=await generateFallback(src,b,hash);if(r1.bytes!==r2.bytes||crypto.createHash("sha256").update(fs.readFileSync(a)).digest("hex")!==crypto.createHash("sha256").update(fs.readFileSync(b)).digest("hex"))throw new Error("Deterministic output test failed");}finally{fs.rmSync(dir,{recursive:true,force:true});}
 console.log("PASS: ICMS fallback self-test (exact markup, preservation, fail-closed, idempotency, deterministic PNG and size/dimension gate)");
}
if(require.main===module){const args=process.argv.slice(2);let self=false,site=null;for(let i=0;i<args.length;i++){if(args[i]==="--self-test")self=true;else if(args[i]==="--site-dir")site=args[++i];else throw new Error("Unknown argument: "+args[i]);}if(!self&&!site)throw new Error("Provide --self-test or --site-dir");(async()=>{if(self)await selfTest();if(site)await build(site);})().catch(e=>{console.error(e);process.exit(1);});}
