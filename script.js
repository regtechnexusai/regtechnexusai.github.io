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


  /* Desktop homepage toolkit rail: gentle automatic horizontal movement.
     User interaction pauses the movement briefly so links remain easy to use. */
  const desktopRail = document.querySelector('.desktop-side-tools__rail');
  if (desktopRail && window.matchMedia('(min-width: 1181px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let desktopRaf = 0;
    let desktopResumeTimer = 0;
    let desktopDirection = 1;

    const desktopMaxScroll = () =>
      Math.max(0, desktopRail.scrollWidth - desktopRail.clientWidth);

    const stopDesktopAuto = () => {
      if (desktopRaf) cancelAnimationFrame(desktopRaf);
      desktopRaf = 0;
    };

    const desktopAutoMove = () => {
      const max = desktopMaxScroll();
      if (document.hidden || max <= 1) {
        desktopRaf = requestAnimationFrame(desktopAutoMove);
        return;
      }
      const next = desktopRail.scrollLeft + (desktopDirection * 0.55);
      if (next >= max) {
        desktopRail.scrollLeft = max;
        desktopDirection = -1;
      } else if (next <= 0) {
        desktopRail.scrollLeft = 0;
        desktopDirection = 1;
      } else {
        desktopRail.scrollLeft = next;
      }
      desktopRaf = requestAnimationFrame(desktopAutoMove);
    };

    const startDesktopAuto = () => {
      if (!desktopRaf) desktopRaf = requestAnimationFrame(desktopAutoMove);
    };

    const pauseDesktopAuto = () => {
      stopDesktopAuto();
      clearTimeout(desktopResumeTimer);
      desktopResumeTimer = setTimeout(startDesktopAuto, 1800);
    };

    desktopRail.addEventListener('pointerdown', pauseDesktopAuto, {passive:true});
    desktopRail.addEventListener('wheel', pauseDesktopAuto, {passive:true});
    /* Keep auto-movement active on hover; pause only for direct interaction. */
    desktopRail.addEventListener('touchstart', pauseDesktopAuto, {passive:true});
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopDesktopAuto();
      else startDesktopAuto();
    });
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 1181px)').matches) startDesktopAuto();
      else stopDesktopAuto();
    });

    startDesktopAuto();
  }

  /* Mobile homepage toolkit: switch to a one-line, touch-scrollable
     auto-moving rail after the page starts scrolling. */
  const toolkitRail = document.querySelector('.mobile-toolkit-tabs');
  if (toolkitRail && window.matchMedia('(max-width: 760px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let railActive = false;
    let direction = 1;
    let rafId = 0;
    let resumeTimer = 0;

    const maxScroll = () => Math.max(0, toolkitRail.scrollWidth - toolkitRail.clientWidth);

    const stopAuto = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const autoMove = () => {
      if (!railActive || document.hidden) {
        rafId = 0;
        return;
      }
      const max = maxScroll();
      if (max <= 1) {
        rafId = requestAnimationFrame(autoMove);
        return;
      }
      const next = toolkitRail.scrollLeft + (direction * 0.45);
      if (next >= max) {
        toolkitRail.scrollLeft = max;
        direction = -1;
      } else if (next <= 0) {
        toolkitRail.scrollLeft = 0;
        direction = 1;
      } else {
        toolkitRail.scrollLeft = next;
      }
      rafId = requestAnimationFrame(autoMove);
    };

    const startAuto = () => {
      if (!railActive || rafId) return;
      rafId = requestAnimationFrame(autoMove);
    };

    const activateRail = () => {
      if (railActive) return;
      railActive = true;
      toolkitRail.classList.add('is-scroll-rail');
      direction = toolkitRail.scrollLeft >= maxScroll() ? -1 : 1;
      startAuto();
    };

    const deactivateRail = () => {
      railActive = false;
      stopAuto();
      toolkitRail.classList.remove('is-scroll-rail');
      toolkitRail.scrollLeft = 0;
    };

    const syncRail = () => {
      if (window.scrollY > 90) activateRail();
      else deactivateRail();
    };

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        syncRail();
        scrollTicking = false;
      });
    }, { passive: true });

    const pauseForTouch = () => {
      if (!railActive) return;
      stopAuto();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, 1200);
    };

    toolkitRail.addEventListener('touchstart', pauseForTouch, { passive: true });
    toolkitRail.addEventListener('pointerdown', pauseForTouch, { passive: true });
    toolkitRail.addEventListener('mouseenter', pauseForTouch);
    toolkitRail.addEventListener('wheel', pauseForTouch, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto();
      else startAuto();
    });

    window.addEventListener('resize', syncRail);
    syncRail();
  }
})();
