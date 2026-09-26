(() => {
  const tabs = [...document.querySelectorAll('.jurisdiction-tab')];
  const panels = [...document.querySelectorAll('.jurisdiction-panel')];

  const showPanel = (name, updateHash = true) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.jurisdiction === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    if (updateHash) history.replaceState(null, '', `#${name}`);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showPanel(tab.dataset.jurisdiction));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      showPanel(tabs[next].dataset.jurisdiction);
    });
  });

  document.querySelectorAll('.evidence-checklist').forEach((list) => {
    const name = list.dataset.checklist;
    const boxes = [...list.querySelectorAll('input[type="checkbox"]')];
    const score = document.querySelector(`[data-score="${name}"]`);
    const update = () => {
      const completed = boxes.filter((box) => box.checked).length;
      const percentage = Math.round((completed / boxes.length) * 100);
      score.textContent = `${percentage}%`;
      list.dataset.completed = String(completed);
    };
    boxes.forEach((box) => box.addEventListener('change', update));
    const reset = document.querySelector(`[data-reset="${name}"]`);
    reset?.addEventListener('click', () => {
      boxes.forEach((box) => { box.checked = false; });
      update();
    });
    update();
  });

  const requested = window.location.hash.slice(1);
  if (['singapore', 'dubai', 'australia'].includes(requested)) {
    showPanel(requested, false);
    window.setTimeout(() => document.getElementById(`panel-${requested}`)?.scrollIntoView({ block: 'start' }), 0);
  }
})();
