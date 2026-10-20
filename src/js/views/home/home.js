/* Portada: carga de noticias, filtro por medio, distribución y "Cargar más" */

import { observeReveal } from "../../components/effects.js";
import {
  cardSkeleton,
  emptyTemplate,
  errorTemplate,
  featuredSkeleton,
  latestSkeleton,
  storySkeleton,
} from "../../components/states.js";
import { card, featuredStory, latestItem, mediumStory } from "../../components/story.js";
import { LATEST_COUNT, PAGE_SIZE, REFRESH_INTERVAL_MS } from "../../config/settings.js";
import { SOURCES } from "../../config/sources.js";
import { fetchNews } from "../../services/news.js";
import { registerStories } from "../../store/stories.js";
import { updateSummary } from "./indicators.js";
import { buildLayout } from "./layout.js";
import { navLink, sectionBlock, sourceChip, sourceColumn, tickerItem } from "./templates.js";

export const ALL = "all";
const SOURCE_KEY = "source";

const els = {
  view: document.getElementById("home-view"),
  main: document.getElementById("contenido"),
  content: document.getElementById("news-content"),
  status: document.getElementById("status"),
  tabs: document.getElementById("source-tabs"),
  refresh: document.getElementById("refresh-button"),
  newStories: document.getElementById("new-stories"),
  ticker: document.getElementById("ticker"),
  tickerTrack: document.getElementById("ticker-track"),
  featured: document.getElementById("featured"),
  secondary: document.getElementById("secondary"),
  latestList: document.getElementById("latest-list"),
  sections: document.getElementById("sections"),
  bySource: document.getElementById("por-medio"),
  bySourceGrid: document.getElementById("by-source-grid"),
  more: document.getElementById("mas-noticias"),
  grid: document.getElementById("news-grid"),
  loadMore: document.getElementById("load-more"),
  sectionNav: document.getElementById("section-nav"),
  footerSections: document.getElementById("footer-sections"),
};

const state = {
  source: readSavedSource(),
  news: [],
  ids: new Set(),
  /* Medios que fallaron: se ocultan del filtro hasta que vuelvan a responder */
  unavailable: new Set(),
  pending: null,
  controller: null,
  rest: [],
  shown: 0,
};

export const getHomeNews = () => state.news;

/*----------------- FUENTE SELECCIONADA ----------------*/

function readSavedSource() {
  try {
    const saved = localStorage.getItem(SOURCE_KEY);
    return SOURCES.some((s) => s.id === saved) ? saved : ALL;
  } catch {
    return ALL;
  }
}

export function selectSource(id) {
  if (id === state.source) return;
  state.source = id;
  try {
    localStorage.setItem(SOURCE_KEY, id);
  } catch {
    /* sin almacenamiento: la elección solo dura esta visita */
  }
  renderTabs();
  loadNews();

  /* Si se eligió desde más abajo (p. ej. "Por medio"), vuelve al filtro */
  const filter = els.tabs.closest(".filterbar");
  if (filter.getBoundingClientRect().top < 0) filter.scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectedSources() {
  return state.source === ALL ? SOURCES : SOURCES.filter((s) => s.id === state.source);
}

function renderTabs() {
  const visible = SOURCES.filter((s) => !state.unavailable.has(s.id) || s.id === state.source);
  els.tabs.innerHTML = [{ id: ALL, name: "Todas" }, ...visible]
    .map((source) => sourceChip(source, source.id === state.source))
    .join("");
}

/*----------------- PINTADO ----------------*/

function renderSkeletons() {
  els.featured.innerHTML = featuredSkeleton;
  els.secondary.innerHTML = storySkeleton.repeat(2);
  els.latestList.innerHTML = latestSkeleton.repeat(LATEST_COUNT);
  els.sections.innerHTML = "";
  els.bySource.hidden = true;
  els.grid.innerHTML = cardSkeleton.repeat(4);
  els.loadMore.hidden = true;
}

function renderTicker(stories) {
  els.ticker.hidden = stories.length === 0;
  /* La lista va dos veces para que la animación pueda repetirse sin cortes */
  const items = stories.map(tickerItem).join("");
  els.tickerTrack.innerHTML = `<ul class="ticker__list">${items}</ul><ul class="ticker__list" aria-hidden="true">${items}</ul>`;
  els.tickerTrack.style.setProperty("--duration", `${Math.max(stories.length * 7, 30)}s`);
}

function renderNav(sections, hasBySource) {
  const links = [
    navLink("#portada", "Portada"),
    ...sections.map((s) => navLink(`#seccion-${s.id}`, s.name)),
    hasBySource ? navLink("#por-medio", "Por medio") : "",
    navLink("#mas-noticias", "Más noticias"),
  ].join("");
  els.sectionNav.innerHTML = links;
  els.footerSections.innerHTML = links;
}

function appendCards() {
  const next = state.rest.slice(state.shown, state.shown + PAGE_SIZE);
  els.grid.insertAdjacentHTML("beforeend", next.map((story, i) => card(story, i)).join(""));
  state.shown += next.length;
  els.loadMore.hidden = state.shown >= state.rest.length;
  els.loadMore.querySelector("[data-count]").textContent = state.rest.length - state.shown;
}

export function loadMore() {
  appendCards();
  observeReveal(els.grid);
}

function renderPage(layout) {
  renderTicker(layout.ticker);

  els.featured.innerHTML = layout.featured ? featuredStory(layout.featured) : "";
  els.secondary.innerHTML = layout.secondary.map((story, i) => mediumStory(story, i)).join("");
  els.secondary.hidden = layout.secondary.length === 0;
  els.latestList.innerHTML = layout.latest.map(latestItem).join("");

  els.sections.innerHTML = layout.sections.map(sectionBlock).join("");

  els.bySource.hidden = layout.bySource.length === 0;
  els.bySourceGrid.innerHTML = layout.bySource.map(sourceColumn).join("");

  state.rest = layout.rest;
  state.shown = 0;
  els.grid.innerHTML = "";
  appendCards();
  els.more.hidden = state.rest.length === 0;

  renderNav(layout.sections, layout.bySource.length > 0);
  observeReveal(document);
}

/*----------------- ESTADOS ----------------*/

function setLoading(loading) {
  els.main.setAttribute("aria-busy", String(loading));
  els.main.classList.toggle("is-loading", loading);
  els.refresh.disabled = loading;
  els.refresh.classList.toggle("is-loading", loading);
}

function showStatus(html) {
  els.content.hidden = true;
  els.status.hidden = false;
  els.status.innerHTML = html;
}

function applyNews(news) {
  state.news = news;
  state.ids = new Set(news.map((story) => story.id));
  state.pending = null;
  els.newStories.hidden = true;
  registerStories(news);

  els.content.hidden = false;
  els.status.hidden = true;
  renderPage(buildLayout(news, { sources: selectedSources() }));
  updateSummary(news);
}

function trackFailures(sources, failed) {
  sources.forEach((s) => state.unavailable.delete(s.id));
  failed.forEach((s) => state.unavailable.add(s.id));
  renderTabs();
}

/*----------------- CARGA ----------------*/

export async function loadNews({ fresh = false } = {}) {
  state.controller?.abort();
  state.controller = new AbortController();
  const { signal } = state.controller;
  const sources = selectedSources();

  /* Los placeholders solo se muestran si no hay contenido; si no, se atenúa el actual */
  if (state.news.length === 0 || els.content.hidden) {
    els.content.hidden = false;
    els.status.hidden = true;
    renderSkeletons();
  }
  setLoading(true);

  try {
    const { news, failed } = await fetchNews(sources, { signal, fresh });
    trackFailures(sources, failed);
    if (news.length) {
      applyNews(news);
    } else {
      state.news = [];
      showStatus(emptyTemplate());
    }
  } catch (error) {
    if (signal.aborted) return;
    console.error("Error al obtener las noticias:", error);
    trackFailures([], error.failed ?? []);
    state.news = [];
    showStatus(errorTemplate({ showAll: state.source !== ALL }));
  } finally {
    if (!signal.aborted) setLoading(false);
  }
}

/* Revisa en segundo plano si hay notas nuevas y ofrece mostrarlas (solo en la portada) */
async function checkForNewStories() {
  if (document.hidden || els.view.hidden || state.news.length === 0) return;
  try {
    const { news } = await fetchNews(selectedSources(), { fresh: true });
    const count = news.filter((story) => !state.ids.has(story.id)).length;
    if (count === 0) return;

    state.pending = news;
    els.newStories.querySelector("[data-count]").textContent =
      count === 1 ? "1 noticia nueva" : `${count} noticias nuevas`;
    els.newStories.hidden = false;
  } catch {
    /* se vuelve a intentar en la siguiente revisión */
  }
}

export function showNewStories() {
  if (state.pending) applyNews(state.pending);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/*----------------- VISIBILIDAD ----------------*/

export function showHome() {
  els.view.hidden = false;
}

export function hideHome() {
  els.view.hidden = true;
  els.newStories.hidden = true;
}

export function initHome() {
  renderTabs();
  els.refresh.addEventListener("click", () => loadNews({ fresh: true }));
  setInterval(checkForNewStories, REFRESH_INTERVAL_MS);
  loadNews();
}
