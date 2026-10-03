(() => {
  'use strict';

  const BASE = 'https://regtechnexusai.com';
  const API = 'https://api.mymemory.translated.net/get';
  const nativeBn = {
    '/student/architecture/': '/student/architecture/index-bn.html',
    '/student/subjects/mathematics/': '/student/subjects/mathematics/index-bn.html',
    '/student/subjects/mathematics/formulas.html': '/student/subjects/mathematics/formulas-bn.html'
  };

  const languages = [
    ['ar','العربية'],['bn','বাংলা'],['zh-CN','中文（简体）'],['zh-TW','中文（繁體）'],
    ['nl','Nederlands'],['en','English'],['fr','Français'],['de','Deutsch'],
    ['el','Ελληνικά'],['gu','ગુજરાતી'],['hi','हिन्दी'],['id','Bahasa Indonesia'],
    ['it','Italiano'],['ja','日本語'],['kn','ಕನ್ನಡ'],['ko','한국어'],
    ['ms','Bahasa Melayu'],['mr','मराठी'],['fa','فارسی'],['pl','Polski'],
    ['pt','Português'],['ru','Русский'],['es','Español'],['sw','Kiswahili'],
    ['ta','தமிழ்'],['te','తెలుగు'],['th','ไทย'],['tr','Türkçe'],['ur','اردو'],['vi','Tiếng Việt']
  ];

  const originals = new Map();
  const attributeOriginals = new Map();
  const CACHE_KEY = 'rtnxTranslationCacheV2';
  let activeLanguage = 'en';
  let translating = false;

  function currentPath() {
    return location.pathname.replace(/index\.html$/, '').replace(/\/$/, '/') || '/';
  }

  function nativeUrlForEnglish() {
    const p = currentPath();
    if (p.endsWith('/index-bn.html')) return p.replace(/index-bn\.html$/, '');
    if (p.endsWith('/formulas-bn.html')) return p.replace(/formulas-bn\.html$/, 'formulas.html');
    return location.href;
  }

  function nativeBnUrl() {
    const p = currentPath();
    return nativeBn[p] ? BASE + nativeBn[p] : null;
  }

  function isNativeBanglaPage() {
    return document.documentElement.lang.toLowerCase().startsWith('bn') ||
      /\/index-bn\.html$|\/formulas-bn\.html$/.test(location.pathname);
  }

  function cacheRead() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch (_) { return {}; }
  }

  function cacheWrite(cache) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (_) {}
  }

  function rememberText(node) {
    if (!originals.has(node)) originals.set(node, node.nodeValue);
  }

  function rememberAttribute(el, attr) {
    const key = el + '::' + attr;
    if (!attributeOriginals.has(key)) attributeOriginals.set(key, {el, attr, value: el.getAttribute(attr)});
  }

  function shouldTranslateText(node) {
    if (!node.nodeValue || !node.nodeValue.trim()) return false;
    const p = node.parentElement;
    if (!p) return false;
    if (p.closest('.rtnx-language-bar,script,style,noscript,svg,code,pre,kbd,samp,[data-i18n-skip]')) return false;
    if (p.closest('textarea') || p.closest('select option')) return false;
    return /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(node.nodeValue);
  }

  function collectTextNodes() {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) if (shouldTranslateText(n)) out.push(n);
    return out;
  }

  function collectAttributes() {
    const out = [];
    document.querySelectorAll('input[placeholder],textarea[placeholder],[aria-label],[title],img[alt]').forEach(el => {
      if (el.closest('.rtnx-language-bar,[data-i18n-skip]')) return;
      ['placeholder','aria-label','title','alt'].forEach(attr => {
        if (el.hasAttribute(attr) && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(el.getAttribute(attr))) out.push({el, attr, text: el.getAttribute(attr)});
      });
    });
    return out;
  }

  async function translateOne(text, lang) {
    const cache = cacheRead();
    const key = lang + '|' + text;
    if (cache[key]) return cache[key];

    const params = new URLSearchParams({
      q: text.slice(0, 500),
      langpair: 'en|' + lang,
      mt: '1'
    });
    const res = await fetch(API + '?' + params.toString(), {headers:{Accept:'application/json'}});
    if (!res.ok) throw new Error('Translation service HTTP ' + res.status);
    const data = await res.json();
    const translated = data && data.responseData && data.responseData.translatedText;
    if (!translated) throw new Error('No translation returned');
    cache[key] = translated;
    cacheWrite(cache);
    return translated;
  }

  async function translateItems(items, lang, apply) {
    let index = 0;
    const workers = Array.from({length: 3}, async () => {
      while (true) {
        const i = index++;
        if (i >= items.length) return;
        try {
          const translated = await translateOne(items[i].text, lang);
          apply(items[i], translated);
        } catch (_) {}
        updateStatus(Math.min(i + 1, items.length), items.length, lang);
      }
    });
    await Promise.all(workers);
  }

  function updateStatus(done, total, lang) {
    const status = document.getElementById('rtnx-translation-status');
    if (!status) return;
    status.textContent = total ? 'Translating to ' + languageName(lang) + '… ' + done + '/' + total : '';
  }

  function languageName(code) {
    const hit = languages.find(x => x[0] === code);
    return hit ? hit[1] : code;
  }

  function ensureStatus() {
    let status = document.getElementById('rtnx-translation-status');
    if (status) return status;
    status = document.createElement('div');
    status.id = 'rtnx-translation-status';
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    status.className = 'rtnx-translation-status';
    const bar = document.querySelector('.rtnx-language-bar,.top-language-switch');
    if (bar) bar.insertAdjacentElement('afterend', status);
    return status;
  }

  async function translatePage(lang) {
    if (translating || lang === activeLanguage) return;
    if (isNativeBanglaPage() && lang === 'bn') return;

    translating = true;
    const status = ensureStatus();
    status.classList.add('show');
    status.textContent = 'Preparing translation…';

    if (lang === 'en') {
      originals.forEach((value, node) => { if (node.isConnected) node.nodeValue = value; });
      attributeOriginals.forEach(({el, attr, value}) => { if (el.isConnected && value !== null) el.setAttribute(attr, value); });
      document.documentElement.lang = 'en';
      activeLanguage = 'en';
      status.classList.remove('show');
      translating = false;
      return;
    }

    const textItems = collectTextNodes().map(node => {
      rememberText(node);
      return {node, text: originals.get(node)};
    });
    const attrItems = collectAttributes().map(x => {
      rememberAttribute(x.el, x.attr);
      return x;
    });
    const total = textItems.length + attrItems.length;
    updateStatus(0, total, lang);

    await translateItems(textItems, lang, (item, translated) => { item.node.nodeValue = translated; });
    await translateItems(attrItems, lang, (item, translated) => { item.el.setAttribute(item.attr, translated); });

    document.documentElement.lang = lang;
    activeLanguage = lang;
    status.textContent = 'Translated to ' + languageName(lang) + ' on this page.';
    setTimeout(() => status.classList.remove('show'), 2500);
    translating = false;
  }

  function injectStyle() {
    if (document.getElementById('rtnx-language-style')) return;
    const style = document.createElement('style');
    style.id = 'rtnx-language-style';
    style.textContent = `
      .rtnx-language-bar{width:min(1180px,92%);margin:0 auto;padding:9px 0 10px;display:flex;justify-content:flex-end;align-items:center;gap:9px;position:relative;z-index:1001}
      .rtnx-language-bar a,.rtnx-language-bar button{font:inherit;font-weight:900;line-height:1;min-height:42px;padding:9px 13px;border-radius:11px;border:1px solid #cbd8e2;text-decoration:none;cursor:pointer;background:#fff;color:#123c69;box-shadow:0 3px 0 rgba(8,39,70,.12),0 7px 14px rgba(8,39,70,.08)}
      .rtnx-language-bar a.rtnx-active{background:#123c69;color:#fff;border-color:#123c69}
      .rtnx-language-select{position:relative}
      .rtnx-language-select>button{background:#07856f;color:#fff;border-color:#086b5b}
      .rtnx-language-menu{position:absolute;right:0;top:calc(100% + 7px);width:250px;max-height:330px;overflow:auto;padding:7px;background:#fff;border:1px solid #cbd8e2;border-radius:12px;box-shadow:0 16px 34px rgba(8,39,70,.18);display:none;z-index:2000}
      .rtnx-language-menu.open{display:block}
      .rtnx-language-menu a{display:block;min-height:0;padding:9px 10px;border:0;border-radius:8px;box-shadow:none;color:#17324d;font-weight:750}
      .rtnx-language-menu a:hover,.rtnx-language-menu a:focus{background:#eef6fb;text-decoration:none}
      .rtnx-language-note{font-size:.72rem;color:#64748b;margin:2px 3px 5px}
      .rtnx-translation-status{display:none;width:min(1180px,92%);margin:0 auto 8px;padding:7px 10px;border:1px solid #d8e4ec;border-radius:9px;background:#f5f9fc;color:#31526e;font-size:.78rem;text-align:right}
      .rtnx-translation-status.show{display:block}
      @media(max-width:650px){.rtnx-language-bar{width:calc(100% - 20px);padding:7px 0;gap:7px}.rtnx-language-bar a,.rtnx-language-bar button{min-height:40px;padding:8px 10px;font-size:.82rem}.rtnx-language-menu{width:220px;max-height:280px}.rtnx-translation-status{width:calc(100% - 20px);text-align:center}}
    `;
    document.head.appendChild(style);
  }

  function buildBar() {
    if (document.querySelector('.rtnx-language-bar')) return;
    injectStyle();

    const existing = document.querySelector('.top-language-switch');
    const bar = existing || document.createElement('div');
    let en, bn;

    if (!existing) {
      bar.className = 'rtnx-language-bar';
      const header = document.querySelector('header');
      if (header) header.insertAdjacentElement('afterend', bar);
      else document.body.insertAdjacentElement('afterbegin', bar);
    } else {
      bar.classList.add('rtnx-language-bar');
      const existingLinks = [...bar.querySelectorAll('a')];
      en = existingLinks[0] || null;
      bn = existingLinks[1] || null;
    }

    if (!en) {
      en = document.createElement('a');
      en.textContent = 'English';
      en.setAttribute('aria-label','English');
      bar.appendChild(en);
    }
    if (!bn) {
      bn = document.createElement('a');
      bn.textContent = 'বাংলা';
      bn.setAttribute('aria-label','বাংলা');
      bar.appendChild(bn);
    }

    const nativeBn = nativeBnUrl();
    en.href = nativeUrlForEnglish();
    bn.href = nativeBn || '#';
    en.classList.toggle('rtnx-active', !isNativeBanglaPage() && activeLanguage === 'en');
    bn.classList.toggle('rtnx-active', isNativeBanglaPage() || activeLanguage === 'bn');

    en.onclick = e => {
      if (!isNativeBanglaPage() && activeLanguage !== 'en') {
        e.preventDefault();
        translatePage('en');
        en.classList.add('rtnx-active'); bn.classList.remove('rtnx-active');
      }
    };
    bn.onclick = e => {
      if (nativeBn) return;
      e.preventDefault();
      translatePage('bn');
      bn.classList.add('rtnx-active'); en.classList.remove('rtnx-active');
    };

    const wrap = document.createElement('div');
    wrap.className = 'rtnx-language-select';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.textContent = '🌐 Select Language';
    trigger.setAttribute('aria-haspopup','true');
    trigger.setAttribute('aria-expanded','false');

    const menu = document.createElement('div');
    menu.className = 'rtnx-language-menu';
    menu.setAttribute('role','menu');
    const note = document.createElement('div');
    note.className = 'rtnx-language-note';
    note.textContent = 'Translates this page in place · technical terms may remain in English';
    menu.appendChild(note);

    languages.forEach(([code,label]) => {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = label;
      a.setAttribute('role','menuitem');
      a.dataset.lang = code;
      a.addEventListener('click', e => {
        e.preventDefault();
        menu.classList.remove('open');
        trigger.setAttribute('aria-expanded','false');
        if (code === 'en') translatePage('en');
        else if (code === 'bn' && nativeBn) location.href = nativeBn;
        else translatePage(code);
      });
      menu.appendChild(a);
    });

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const open = menu.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', () => {
      menu.classList.remove('open');
      trigger.setAttribute('aria-expanded','false');
    });
    menu.addEventListener('click', e => e.stopPropagation());

    wrap.append(trigger, menu);
    bar.appendChild(wrap);
  }

  function run() {
    if (!document.head) return;
    injectStyle();
    buildBar();
    if (isNativeBanglaPage()) activeLanguage = 'bn';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
})();