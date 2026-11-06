(() => {
  "use strict";
  const grid = document.getElementById("pattern-grid");
  const search = document.getElementById("pattern-search");
  const resultText = document.getElementById("pattern-results");
  const count = document.getElementById("pattern-count");
  const empty = document.getElementById("pattern-empty");
  const filters = Array.from(document.querySelectorAll(".gfc-filter"));
  if (!grid || !search || !resultText || !count || !empty) return;

  const sourceLinks = {
    fatf_tbml: "https://www.fatf-gafi.org/en/publications/Methodsandtrends/Trade-based-money-laundering-indicators.html",
    basel_aml: "https://www.bis.org/committees/bcbs/basel-consolidated-guidelines/module/afs/10"
  };
  let patterns = [];
  let activeDomain = "all";

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function addList(card, heading, items) {
    if (!Array.isArray(items) || !items.length) return;
    card.appendChild(make("h4", "", heading));
    const list = make("ul");
    items.forEach(item => list.appendChild(make("li", "", item)));
    card.appendChild(list);
  }

  function buildCard(item) {
    const card = make("article", "gfc-pattern-card");
    const top = make("div", "gfc-pattern-card__top");
    top.appendChild(make("span", "gfc-pattern-card__domain", item.domainLabel));
    top.appendChild(make("span", "gfc-pattern-card__id", item.id));
    card.appendChild(top);
    card.appendChild(make("h3", "", item.title));
    card.appendChild(make("p", "", item.summary));
    addList(card, "Questions for the reviewer", item.reviewQuestions);
    addList(card, "Evidence that may be relevant", item.evidenceExamples);
    addList(card, "Controls to consider", item.controlConsiderations);
    card.appendChild(make("div", "gfc-pattern-card__limit", item.limitation));
    const sourceBox = make("div", "gfc-pattern-card__sources");
    (item.sourceIds || []).forEach(id => {
      const href = sourceLinks[id];
      if (!href) return;
      const a = make("a", "", id === "fatf_tbml" ? "FATF/Egmont source ↗" : "Basel guidance ↗");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      sourceBox.appendChild(a);
    });
    if (sourceBox.childElementCount) card.appendChild(sourceBox);
    return card;
  }

  function render() {
    const term = search.value.trim().toLowerCase();
    const filtered = patterns.filter(item => {
      const domainMatch = activeDomain === "all" || item.domain === activeDomain;
      const haystack = [item.id, item.title, item.summary, item.domainLabel,
        ...(item.reviewQuestions || []), ...(item.evidenceExamples || []),
        ...(item.controlConsiderations || [])].join(" ").toLowerCase();
      return domainMatch && (!term || haystack.includes(term));
    });
    grid.replaceChildren(...filtered.map(buildCard));
    count.textContent = String(patterns.length);
    resultText.textContent = "Showing " + filtered.length + " of " + patterns.length +
      " review patterns. These are prompts for professional examination, not automated risk decisions.";
    empty.hidden = filtered.length !== 0;
  }

  filters.forEach(button => {
    button.addEventListener("click", () => {
      activeDomain = button.dataset.filter || "all";
      filters.forEach(item => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      render();
    });
  });
  search.addEventListener("input", render);

  fetch("./data/review-patterns.json", { credentials: "same-origin" })
    .then(response => {
      if (!response.ok) throw new Error("Reference data could not be loaded.");
      return response.json();
    })
    .then(data => {
      if (!data || !Array.isArray(data.patterns)) throw new Error("Reference data format is invalid.");
      patterns = data.patterns;
      render();
    })
    .catch(() => {
      count.textContent = "—";
      resultText.textContent = "The reference collection could not be loaded. Please use the primary sources listed on this page.";
      grid.replaceChildren();
    });
})();
