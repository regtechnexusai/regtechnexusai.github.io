(() => {
  const search = document.getElementById('gc-search');
  const cards = Array.from(document.querySelectorAll('.gc-card'));
  const filters = Array.from(document.querySelectorAll('.gc-filter'));
  const count = document.getElementById('gc-result-count');
  const empty = document.getElementById('gc-empty');
  if (!search || !cards.length || !count || !empty) return;
  let active = 'all';
  const update = () => {
    const term = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const topicMatch = active === 'all' || card.dataset.topic === active;
      const searchMatch = !term || (card.dataset.search + ' ' + card.innerText).toLowerCase().includes(term);
      const show = topicMatch && searchMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    count.textContent = 'Showing ' + visible + ' of ' + cards.length + ' source frameworks';
    empty.hidden = visible !== 0;
  };
  search.addEventListener('input', update);
  filters.forEach(button => button.addEventListener('click', () => {
    active = button.dataset.filter || 'all';
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    update();
  }));
  update();
})();