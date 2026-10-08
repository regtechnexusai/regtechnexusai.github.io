/* RegTech Nexus AI · Amazon resource layer
 * Uses ordinary tagged Amazon.com links until Creators API eligibility is available.
 * No Amazon product data, reviews, prices, images or ratings are copied into the site.
 */
(function(){
  'use strict';
  if(window.__rtAmazonResourcesLoaded)return;
  window.__rtAmazonResourcesLoaded=true;
  var TAG='regtechnexusai-20';
  var A='https://www.amazon.com/s?tag='+TAG+'&k=';
  var configs=[
    {test:function(p){return p==='/student/'||p==='/student'||p==='/student/index.html';},title:'Recommended Study Resources',intro:'Optional third-party learning resources relevant to subjects covered in the Student Knowledge Hub.',items:[
      ['AML / KYC & financial crime','AML KYC financial crime compliance books'],
      ['Trade finance & TBML','trade finance trade based money laundering books'],
      ['AI & machine learning','artificial intelligence machine learning books'],
      ['Architecture & design','architecture design books'],
      ['Mathematics & statistics','mathematics statistics books'],
      ['Finance & risk','finance banking risk management books']
    ]},
    {test:function(p){return p.indexOf('/student/aml-cft/')===0;},title:'Recommended AML/CFT Resources',intro:'Optional learning resources for AML/CFT, KYC, financial crime and compliance study. Verify current regulatory requirements against authoritative sources.',items:[
      ['AML / CFT fundamentals','anti money laundering AML CFT compliance books'],
      ['KYC / CDD / EDD','KYC customer due diligence AML books'],
      ['Financial crime investigation','financial crime investigation forensic accounting books']
    ]},
    {test:function(p){return p.indexOf('/student/incoterms/')===0||p.indexOf('/tbml-')===0;},title:'Recommended Trade & TBML Resources',intro:'Optional learning resources for international trade, trade finance, Incoterms and trade-based financial crime study.',items:[
      ['Trade finance','trade finance international trade books'],
      ['Incoterms & international trade','Incoterms international trade books'],
      ['TBML & trade compliance','trade based money laundering trade compliance books']
    ]},
    {test:function(p){return p==='/student/ai-use.html'||p.indexOf('/student/subjects/computer-science/')===0||p.indexOf('/student/subjects/programming/')===0||p==='/explainable-ai.html'||p==='/agentic-ai-governance.html'||p==='/ai-banking-playbook.html'||p==='/ai-ready-banking.html';},title:'Recommended AI & Governance Resources',intro:'Optional learning resources for AI, machine learning, responsible AI, governance and technology risk.',items:[
      ['AI governance & responsible AI','AI governance responsible AI books'],
      ['Machine learning & AI','machine learning artificial intelligence books'],
      ['Cybersecurity & technology risk','cybersecurity technology risk books']
    ]},
    {test:function(p){return p==='/student/architecture/'||p==='/student/architecture'||p.indexOf('/student/architecture/')===0;},title:'Recommended Architecture Resources',intro:'Optional educational references for architectural design, structures, building technology, BIM and professional practice.',items:[
      ['Architectural design','architectural design theory books'],
      ['Building technology & structures','building construction structural design books'],
      ['BIM / CAD','BIM Revit CAD architecture books']
    ]},
    {test:function(p){return p.indexOf('/student/subjects/mathematics/')===0||p.indexOf('/student/subjects/statistics/')===0;},title:'Recommended Mathematics & Statistics Resources',intro:'Optional learning references for mathematics, statistics, probability and quantitative methods.',items:[
      ['Mathematics fundamentals','mathematics algebra calculus geometry books'],
      ['Statistics & probability','statistics probability books'],
      ['Quantitative methods','quantitative methods mathematics finance books']
    ]}
  ];
  var path=window.location.pathname.replace(/\\/+$/,'/')||'/';
  var cfg=null;
  for(var i=0;i<configs.length;i++){if(configs[i].test(path)){cfg=configs[i];break;}}
  if(!cfg)return;
  if(document.querySelector('.rt-amazon-resources'))return;
  var section=document.createElement('section');
  section.className='rt-amazon-resources';
  section.setAttribute('aria-labelledby','rt-amazon-resources-title');
  var head=document.createElement('div');head.className='rt-amazon-resources__head';
  var h=document.createElement('div');
  h.innerHTML='<h2 id="rt-amazon-resources-title">📚 '+cfg.title+'</h2><p>'+cfg.intro+'</p>';
  head.appendChild(h);section.appendChild(head);
  var grid=document.createElement('div');grid.className='rt-amazon-resources__grid';
  cfg.items.forEach(function(item){
    var a=document.createElement('a');
    a.className='rt-amazon-resource';
    a.href=A+encodeURIComponent(item[1]);
    a.target='_blank';a.rel='sponsored noopener noreferrer';
    a.innerHTML='<span><span class="rt-amazon-resource__title">'+item[0]+'</span><span class="rt-amazon-resource__meta">Open relevant Amazon results</span></span><span class="rt-amazon-resource__cta">View on Amazon ↗</span>';
    grid.appendChild(a);
  });
  section.appendChild(grid);
  var d=document.createElement('p');d.className='rt-amazon-resources__disclosure';
  d.innerHTML='Amazon affiliate disclosure: As an Amazon Associate I earn from qualifying purchases. Amazon links are optional third-party resources and are not regulatory endorsements.';
  section.appendChild(d);
  var host=document.querySelector('main')||document.body;
  var footer=document.querySelector('footer');
  if(footer&&footer.parentNode===host.parentNode)host.parentNode.insertBefore(section,footer);
  else host.appendChild(section);
})();
