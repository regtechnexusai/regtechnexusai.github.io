(() => {
  const ROOT = location.origin;
  const CSS = '/site-search.css';
  if (!document.querySelector('link[data-rnx-search-css]')) {
    const link = document.createElement('link'); link.rel='stylesheet'; link.href=CSS; link.dataset.rnxSearchCss='1'; document.head.appendChild(link);
  }
  const norm = s => (s || '').replace(/\\s+/g,' ').trim();
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pathLabel = u => { try { const p=new URL(u,ROOT).pathname; return p==='/'?'Home':p.replace(/^\\//,'').replace(/\\/$/,'').replace(/[-_]+/g,' ').replace(/\\.html$/i,'').replace(/\\//g,' › ') || 'Home'; } catch { return u; } };

  function ensureUI(){
    if(document.getElementById('rnx-search-backdrop')) return;
    const header=document.querySelector('header.nav, header.site-header, header, .site-header');
    if(!header) return;
    const nav=header.querySelector('nav');
    const a=document.createElement('a'); a.className='rnx-search-trigger'; a.href='#rnx-search'; a.setAttribute('aria-label','Search RegTech Nexus AI'); a.innerHTML='⌕ <span>Search</span>';
    (nav || header).appendChild(a);
    a.addEventListener('click',e=>{e.preventDefault();openSearch();});
    const wrap=document.createElement('div'); wrap.id='rnx-search-backdrop'; wrap.className='rnx-search-backdrop'; wrap.hidden=true;
    wrap.innerHTML='<section class="rnx-search-dialog" role="dialog" aria-modal="true" aria-labelledby="rnx-search-title"><div class="rnx-search-head"><h2 id="rnx-search-title">Search RegTech Nexus AI</h2><button class="rnx-search-close" type="button" aria-label="Close search">Close</button></div><form class="rnx-search-form"><input class="rnx-search-input" type="search" autocomplete="off" placeholder="Search a topic, tool, subject or keyword…" aria-label="Search site"><button class="rnx-search-submit" type="submit">Search</button></form><div class="rnx-search-status" aria-live="polite">Loading site topics…</div><div class="rnx-search-results"></div></section>';
    document.body.appendChild(wrap);
    wrap.querySelector('.rnx-search-close').addEventListener('click',closeSearch);
    wrap.addEventListener('click',e=>{if(e.target===wrap)closeSearch();});
    wrap.querySelector('form').addEventListener('submit',e=>{e.preventDefault();runSearch(wrap.querySelector('input').value);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!wrap.hidden)closeSearch();});
  }
  let indexPromise;
  async function buildIndex(){
    if(indexPromise) return indexPromise;
    indexPromise=(async()=>{
      const xml=await fetch('/sitemap.xml',{cache:'no-cache'}).then(r=>r.text());
      const doc=new DOMParser().parseFromString(xml,'application/xml');
      const urls=[...doc.querySelectorAll('loc')].map(x=>x.textContent.trim()).filter(Boolean);
      const pages=await Promise.all(urls.map(async u=>{
        try{
          const html=await fetch(u,{cache:'no-cache'}).then(r=>r.text());
          const d=new DOMParser().parseFromString(html,'text/html');
          const title=norm(d.querySelector('title')?.textContent)||pathLabel(u);
          const desc=norm(d.querySelector('meta[name="description"]')?.getAttribute('content'));
          const heads=[...d.querySelectorAll('h1,h2,h3')].map(x=>norm(x.textContent)).filter(Boolean).slice(0,35);
          const body=norm(d.body?.textContent).slice(0,30000);
          return {url:u,title,desc,heads,text:(title+' '+desc+' '+heads.join(' ')+' '+body).toLowerCase()};
        }catch{return null;}
      }));
      return pages.filter(Boolean);
    })().catch(()=>[]);
    return indexPromise;
  }
  function openSearch(){
    const b=document.getElementById('rnx-search-backdrop'); if(!b) return;
    b.hidden=false; const input=b.querySelector('input'); input.focus(); loadStatus(b);
  }
  function closeSearch(){const b=document.getElementById('rnx-search-backdrop'); if(b)b.hidden=true;}
  async function loadStatus(b){const idx=await buildIndex(); b.querySelector('.rnx-search-status').textContent=idx.length+' site pages indexed. Search by topic, tool, subject or keyword.';}
  async function runSearch(q){
    const b=document.getElementById('rnx-search-backdrop'), status=b.querySelector('.rnx-search-status'), out=b.querySelector('.rnx-search-results');
    q=norm(q).toLowerCase(); if(!q){out.innerHTML=''; status.textContent='Type a topic or keyword to search the site.'; return;}
    const idx=await buildIndex(); const terms=q.split(/\\s+/).filter(Boolean);
    const results=idx.map(p=>{let score=0; for(const t of terms){if(p.title.toLowerCase().includes(t))score+=12;if(p.heads.join(' ').toLowerCase().includes(t))score+=7;if(p.desc.toLowerCase().includes(t))score+=4;if(p.text.includes(t))score+=1;} return {...p,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,20);
    status.textContent=results.length?results.length+' result'+(results.length===1?'':'s')+' found.':'No matching page found.';
    out.innerHTML=results.length?results.map(p=>'<a class="rnx-search-result" href="'+esc(p.url)+'"><strong>'+esc(p.title)+'</strong><small>'+esc(pathLabel(p.url))+' · '+esc(p.desc||p.heads.slice(0,3).join(' · '))+'</small></a>').join(''):'<div class="rnx-search-empty">No matching topic was found. Try a broader keyword such as AML, TBML, AI, Architecture, Mathematics, IFRS, Risk, Audit or Regulation.</div>';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureUI);else ensureUI();
})();