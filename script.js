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
})();
