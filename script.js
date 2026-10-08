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


  /* Unified top quick-access rail: reliable automatic left↔right movement. */
  const toolkitRail = document.querySelector('.mobile-toolkit-tabs');
  if (toolkitRail) {
    let direction = 1;
    let rafId = 0;
    let resumeTimer = 0;
    let lastTime = 0;

    const maxScroll = () =>
      Math.max(0, toolkitRail.scrollWidth - toolkitRail.clientWidth);

    const stopAuto = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;
    };

    const autoMove = (time) => {
      if (document.hidden) {
        lastTime = time;
        rafId = requestAnimationFrame(autoMove);
        return;
      }

      const max = maxScroll();
      if (max <= 1) {
        lastTime = time;
        rafId = requestAnimationFrame(autoMove);
        return;
      }

      if (!lastTime) lastTime = time;
      const elapsed = Math.min(32, time - lastTime);
      lastTime = time;

      /* Deliberately visible movement on phones while remaining smooth. */
      const pixelsPerSecond = window.innerWidth <= 760 ? 42 : 38;
      const step = pixelsPerSecond * (elapsed / 1000);
      let next = toolkitRail.scrollLeft + direction * step;

      if (next >= max) {
        next = max;
        direction = -1;
      } else if (next <= 0) {
        next = 0;
        direction = 1;
      }

      toolkitRail.scrollLeft = next;
      rafId = requestAnimationFrame(autoMove);
    };

    const startAuto = () => {
      if (!rafId) {
        lastTime = 0;
        rafId = requestAnimationFrame(autoMove);
      }
    };

    const pauseBriefly = () => {
      stopAuto();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, 1200);
    };

    ['pointerdown', 'touchstart', 'wheel'].forEach((eventName) => {
      toolkitRail.addEventListener(eventName, pauseBriefly, { passive: true });
    });

    toolkitRail.addEventListener('mouseenter', pauseBriefly, { passive: true });
    toolkitRail.addEventListener('mouseleave', startAuto, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto();
      else startAuto();
    });

    window.addEventListener('resize', startAuto, { passive: true });
    window.addEventListener('load', startAuto, { passive: true });

    startAuto();
  }})();
