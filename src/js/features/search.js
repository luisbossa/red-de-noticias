import { compactStory } from "../components/story.js";
import { emptyListTemplate } from "../components/states.js";
import { debounce, normalizeText } from "../lib/text.js";

const MAX_RESULTS = 20;

const els = {
  dialog: document.getElementById("search-dialog"),
  input: document.getElementById("search-input"),
  results: document.getElementById("search-results"),
  summary: document.getElementById("search-summary"),
};

let getNews = () => [];

function search(query) {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  const news = getNews();

  if (terms.length === 0) {
    els.summary.textContent = `Buscá entre ${news.length} noticias cargadas.`;
    els.results.innerHTML = "";
    return;
  }

  const matches = news.filter((story) => {
    const haystack = normalizeText(`${story.title} ${story.excerpt} ${story.category} ${story.source.name}`);
    return terms.every((term) => haystack.includes(term));
  });

  els.summary.textContent = matches.length
    ? `${matches.length} ${matches.length === 1 ? "resultado" : "resultados"}`
    : "";
  els.results.innerHTML = matches.length
    ? matches.slice(0, MAX_RESULTS).map((story) => compactStory(story)).join("")
    : emptyListTemplate("ri-search-eye-line", "Sin resultados", "Probá con otra palabra.");
}

/* Abre la búsqueda; con `query` la deja escrita (p. ej. al tocar una etiqueta) */
export function openSearch(query) {
  if (typeof query === "string") els.input.value = query;
  if (!els.dialog.open) els.dialog.showModal();
  els.input.select();
  search(els.input.value);
}

export function initSearch(newsProvider) {
  getNews = newsProvider;
  els.input.addEventListener("input", debounce(() => search(els.input.value), 120));

  /* "/" o Ctrl+K abren la búsqueda (salvo que se esté escribiendo en un campo) */
  document.addEventListener("keydown", (event) => {
    const typing = event.target.closest("input, textarea, [contenteditable]");
    const shortcut = (event.key === "/" && !typing) || (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey));
    if (shortcut && !els.dialog.open) {
      event.preventDefault();
      openSearch();
    }
  });
}
