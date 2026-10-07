(() => {
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.nav');

  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  document.querySelectorAll('a[href="#ai-assistant"]').forEach((link) => {
    link.href = 'index.html#ai-assistant';
  });

  if (!document.getElementById('ai-assistant')) {
    const assistantAnchor = document.createElement('span');
    assistantAnchor.id = 'ai-assistant';
    assistantAnchor.hidden = true;
    document.body.prepend(assistantAnchor);
  }


  /* Unified top quick-access rail: automatic left↔right movement. */
  const toolkitRail = document.querySelector('.mobile-toolkit-tabs');
  if (toolkitRail) {
    let direction = 1, rafId = 0, resumeTimer = 0;
    const maxScroll = () => Math.max(0, toolkitRail.scrollWidth - toolkitRail.clientWidth);
    const stopAuto = () => { if (rafId) cancelAnimationFrame(rafId); rafId = 0; };
    const autoMove = () => {
      if (document.hidden) { rafId = requestAnimationFrame(autoMove); return; }
      const max = maxScroll();
      if (max <= 1) { rafId = requestAnimationFrame(autoMove); return; }
      const step = window.innerWidth >= 1181 ? 0.65 : 0.45;
      const next = toolkitRail.scrollLeft + direction * step;
      if (next >= max) { toolkitRail.scrollLeft = max; direction = -1; }
      else if (next <= 0) { toolkitRail.scrollLeft = 0; direction = 1; }
      else toolkitRail.scrollLeft = next;
      rafId = requestAnimationFrame(autoMove);
    };
    const startAuto = () => { if (!rafId) rafId = requestAnimationFrame(autoMove); };
    const pauseBriefly = () => { stopAuto(); clearTimeout(resumeTimer); resumeTimer = setTimeout(startAuto, 900); };
    ['pointerdown','touchstart','wheel'].forEach(e => toolkitRail.addEventListener(e, pauseBriefly, {passive:true}));
    document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());
    window.addEventListener('resize', startAuto, {passive:true});
    startAuto();
  }
})();
