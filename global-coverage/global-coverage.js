(() => {
  const menu = document.querySelector('.gc-nav .menu');
  const nav = document.getElementById('main-nav');
  if (menu && nav) menu.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  const mapRoot = document.getElementById('gc-world-map');
  const countrySearch = document.getElementById('gc-country-search');
  const selectButton = document.getElementById('gc-select-country');
  const datalist = document.getElementById('gc-country-options');
  const selectedTitle = document.getElementById('gc-selected-title');
  const countryName = document.getElementById('gc-country-name');
  const evidenceCount = document.getElementById('gc-evidence-count');
  const reviewDate = document.getElementById('gc-review-date');
  const statusText = document.getElementById('gc-overall-status');
  const statusDetail = document.getElementById('gc-overall-detail');
  let features = [];
  let selectedFeature = null;
  let selectedPath = null;
  let mapSvg = null;
  let projection = null;
  let mapPath = null;

  const safeText = (v) => String(v || '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalise = (v) => String(v || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const setSelected = (feature, path) => {
    selectedFeature = feature || null;
    if (selectedPath) selectedPath.classList.remove('is-selected');
    selectedPath = path || null;
    if (selectedPath) selectedPath.classList.add('is-selected');
    const name = feature && feature.properties && (feature.properties.name || feature.properties.NAME);
    const label = name || (countrySearch.value.trim() || 'Selected jurisdiction');
    selectedTitle.textContent = label;
    countryName.textContent = label;
    evidenceCount.textContent = 'No verified records loaded';
    reviewDate.textContent = 'Not recorded';
    statusText.textContent = 'Not assessed';
    statusDetail.textContent = 'The interface supports worldwide selection, but this jurisdiction’s topic-by-topic official evidence has not been verified in this release.';
    if (countrySearch.value !== label) countrySearch.value = label;
    document.querySelectorAll('#gc-topic-matrix tbody tr').forEach(row => {
      row.querySelectorAll('td:nth-child(3)').forEach(cell => cell.textContent = 'Not yet verified');
      const pill = row.querySelector('.gc-status-pill');
      if (pill) { pill.textContent = 'Not assessed'; pill.className = 'gc-status-pill'; }
    });
  };
  const drawMap = () => {
    if (!window.d3 || !window.topojson || !features.length || !mapRoot) {
      const loading = document.getElementById('gc-map-loading');
      if (loading) loading.textContent = 'Interactive map could not load. Use the jurisdiction search field; all status labels remain evidence-based.';
      return;
    }
    mapRoot.innerHTML = '';
    const width = Math.max(320, mapRoot.clientWidth || 760);
    const height = Math.max(190, Math.min(390, width * 0.53));
    mapSvg = window.d3.select(mapRoot).append('svg').attr('viewBox', '0 0 ' + width + ' ' + height).attr('role','group').attr('aria-label','Selectable world map');
    projection = window.d3.geoNaturalEarth1().fitExtent([[5,5],[width-5,height-5]], {type:'FeatureCollection',features});
    mapPath = window.d3.geoPath(projection);
    mapSvg.selectAll('path').data(features).join('path')
      .attr('d', mapPath)
      .attr('tabindex', 0)
      .attr('role','button')
      .attr('aria-label', d => (d.properties && d.properties.name || 'Jurisdiction') + ', status not assessed')
      .append('title').text(d => (d.properties && d.properties.name || 'Jurisdiction') + ' — not assessed');
    mapSvg.selectAll('path')
      .on('click', function(event,d){setSelected(d,this);})
      .on('keydown', function(event,d){if(event.key === 'Enter' || event.key === ' '){event.preventDefault();setSelected(d,this);}});
    const names = features.map(f => f.properties && f.properties.name).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    datalist.innerHTML = names.map(n => '<option value="' + safeText(n) + '"></option>').join('');
    if (names.length) {
      countrySearch.placeholder = 'Search ' + names.length + ' map jurisdictions…';
      statusDetail.textContent = 'Select a jurisdiction to begin a structured evidence review.';
    }
  };
  const loadMap = async () => {
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', {mode:'cors'});
      if (!response.ok) throw new Error('Map data unavailable');
      const world = await response.json();
      features = window.topojson.feature(world, world.objects.countries).features;
      drawMap();
    } catch (e) {
      const loading = document.getElementById('gc-map-loading');
      if (loading) loading.textContent = 'World map data is unavailable right now. Search is available for manually entered jurisdiction names; no country is assigned a verified status.';
      statusDetail.textContent = 'Map data did not load; use the text field to select a jurisdiction label.';
    }
  };
  const selectByName = () => {
    const query = normalise(countrySearch.value);
    if (!query) return;
    const feature = features.find(f => normalise(f.properties && f.properties.name) === query)
      || features.find(f => normalise(f.properties && f.properties.name).includes(query));
    if (feature) {
      const node = mapSvg ? mapSvg.selectAll('path').filter(d => d === feature).node() : null;
      setSelected(feature, node);
    } else {
      setSelected({properties:{name:countrySearch.value.trim()}}, null);
    }
  };
  if (selectButton) selectButton.addEventListener('click', selectByName);
  if (countrySearch) countrySearch.addEventListener('keydown', e => {if(e.key === 'Enter'){e.preventDefault();selectByName();}});
  if (mapRoot) loadMap();

  const sourceSearch = document.getElementById('gc-source-search');
  const cards = Array.from(document.querySelectorAll('#gc-cards .gc-card'));
  const filters = Array.from(document.querySelectorAll('.gc-sources .gc-filter'));
  const count = document.getElementById('gc-result-count');
  const empty = document.getElementById('gc-empty');
  let active = 'all';
  const updateSources = () => {
    const term = sourceSearch ? sourceSearch.value.trim().toLowerCase() : '';
    let visible = 0;
    cards.forEach(card => {
      const topicMatch = active === 'all' || card.dataset.topic === active;
      const searchMatch = !term || ((card.dataset.search || '') + ' ' + card.innerText).toLowerCase().includes(term);
      const show = topicMatch && searchMatch;
      card.hidden = !show;
      if (show) visible++;
    });
    if (count) count.textContent = 'Showing ' + visible + ' of ' + cards.length + ' source frameworks';
    if (empty) empty.hidden = visible !== 0;
  };
  if (sourceSearch) sourceSearch.addEventListener('input', updateSources);
  filters.forEach(button => button.addEventListener('click', () => {
    active = button.dataset.filter || 'all';
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    updateSources();
  }));
  const loadRegisterData = async () => {
    try {
      const response = await fetch('/global-coverage/coverage-data.json', {mode:'same-origin'});
      if (!response.ok) throw new Error('Register data unavailable');
      const register = await response.json();
      const tbody = document.querySelector('#gc-topic-matrix tbody');
      if (!tbody || !Array.isArray(register.topic_domains)) return;
      tbody.innerHTML = register.topic_domains.map(domain => {
        const topicKey = (domain.id + ' ' + domain.label + ' ' + domain.evidence_required.join(' ')).toLowerCase().replace(/"/g,'&quot;');
        const next = domain.evidence_required.slice(0,4).join('; ');
        return '<tr data-topic="' + safeText(topicKey) + '"><td><b>' + safeText(domain.label) + '</b></td><td>' + safeText(domain.baseline) + '</td><td>Not yet verified</td><td><span class="gc-status-pill">Not assessed</span></td><td>Verify: ' + safeText(next) + '.</td></tr>';
      }).join('');
      const count = register.topic_domains.length;
      const heading = document.querySelector('.gc-matrix-head h3');
      if (heading) heading.textContent = 'Coverage areas (' + count + ' domains) for selected jurisdiction';
      if (register.coverage_note) {
        const note = document.querySelector('.gc-matrix-footnote');
        if (note) note.textContent = register.coverage_note;
      }
    } catch (e) {
      // Keep the static matrix as a graceful fallback if the data file is unavailable.
    }
  };
  loadRegisterData();

  const topicSearch = document.getElementById('gc-topic-filter');
  if (topicSearch) topicSearch.addEventListener('input', () => {
    const term = topicSearch.value.trim().toLowerCase();
    document.querySelectorAll('#gc-topic-matrix tbody tr').forEach(row => {
      row.hidden = !!term && !(row.dataset.topic + ' ' + row.innerText).toLowerCase().includes(term);
    });
  });
  updateSources();
})();