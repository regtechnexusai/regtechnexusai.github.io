(() => {
  'use strict';

  const BASE = 'https://regtechnexusai.com';
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

  function currentPath() {
    return location.pathname.replace(/index\.html$/, '').replace(/\/$/, '/') || '/';
  }

  function translateUrl(lang) {
    const target = encodeURIComponent(location.href);
    return 'https://translate.google.com/translate?sl=auto&tl=' + encodeURIComponent(lang) + '&u=' + target;
  }

  function nativeUrlForEnglish() {
    const p = currentPath();
    if (p.endsWith('/index-bn.html')) return p.replace(/index-bn\.html$/, '');
    if (p.endsWith('/formulas-bn.html')) return p.replace(/formulas-bn\.html$/, 'formulas.html');
    return BASE + '/student/';
  }

  function nativeBnUrl() {
    const p = currentPath();
    if (nativeBn[p]) return BASE + nativeBn[p];
    if (p.endsWith('/index-bn.html')) return location.href;
    if (p.endsWith('/formulas-bn.html')) return location.href;
    return translateUrl('bn');
  }

  function isBanglaPage() {
    return document.documentElement.lang.toLowerCase().startsWith('bn') ||
      /\/index-bn\.html$|\/formulas-bn\.html$/.test(location.pathname);
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
      @media(max-width:650px){.rtnx-language-bar{width:calc(100% - 20px);padding:7px 0;gap:7px}.rtnx-language-bar a,.rtnx-language-bar button{min-height:40px;padding:8px 10px;font-size:.82rem}.rtnx-language-menu{width:220px;max-height:280px}}
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

    en.href = isBanglaPage() ? nativeUrlForEnglish() : location.href;
    bn.href = isBanglaPage() ? location.href : nativeBnUrl();
    en.classList.toggle('rtnx-active', !isBanglaPage());
    bn.classList.toggle('rtnx-active', isBanglaPage());

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
    note.textContent = 'Machine translation fallback · technical terms may remain in English';
    menu.appendChild(note);

    languages.forEach(([code,label]) => {
      const a = document.createElement('a');
      a.href = translateUrl(code);
      a.textContent = label;
      a.setAttribute('role','menuitem');
      a.dataset.lang = code;
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
    buildBar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
})();