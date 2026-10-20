/* Punto de entrada: inicia los módulos, decide qué vista mostrar según la URL
   y atiende las acciones globales (guardar, compartir, diálogos...) */

import { initScrollEffects, startRelativeTimes } from "./components/effects.js";
import { toast } from "./components/toast.js";
import { APP_NAME, COMPANY_NAME, LOCALE } from "./config/settings.js";
import { SOURCES } from "./config/sources.js";
import { initSaved, openSaved } from "./features/saved-panel.js";
import { initSearch, openSearch } from "./features/search.js";
import { initTheme } from "./features/theme.js";
import { formatToday } from "./lib/format.js";
import { escapeHTML } from "./lib/html.js";
import { startRouter } from "./router.js";
import { saved } from "./store/saved.js";
import { getStory } from "./store/stories.js";
import { changeFontSize, hideArticle, initArticle, retryArticle, showArticle } from "./views/article/article.js";
import { getHomeNews, hideHome, initHome, loadMore, loadNews, selectSource, showHome, showNewStories } from "./views/home/home.js";
import { loadIndicators } from "./views/home/indicators.js";

/*----------------- NAVEGACIÓN ENTRE VISTAS ----------------*/

let lastRoute = null;
let homeScroll = 0;
/* true si la nota actual se abrió navegando dentro de la app (no por enlace directo) */
let openedInApp = false;

function onRoute(route) {
  document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());

  if (route.name === "article") {
    openedInApp = lastRoute !== null;
    if (lastRoute?.name !== "article") homeScroll = window.scrollY;
    hideHome();
    showArticle(route);
  } else {
    const fromArticle = lastRoute?.name === "article";
    hideArticle();
    showHome();
    document.title = APP_NAME;

    if (route.anchor) {
      document.getElementById(route.anchor)?.scrollIntoView({ behavior: fromArticle ? "instant" : "smooth" });
    } else if (fromArticle) {
      /* Al volver de una nota se regresa al mismo punto de la portada */
      window.scrollTo({ top: homeScroll, behavior: "instant" });
    }
  }
  lastRoute = route;
}

/* "Volver": si se llegó a la nota desde la app, regresa en el historial; si se entró directo, va a la portada */
function goBack() {
  if (openedInApp) history.back();
  else location.hash = "#/";
}

/*----------------- ACCIONES ----------------*/

function findStory(id) {
  return getStory(id) ?? saved.get(id);
}

async function shareStory(story) {
  if (!story?.url) return;
  if (navigator.share) {
    try {
      await navigator.share({ title: story.title, url: story.url });
    } catch {
      /* el usuario canceló */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(story.url);
    toast("Enlace de la nota original copiado", "ri-link");
  } catch {
    toast("No se pudo copiar el enlace", "ri-error-warning-line");
  }
}

const actions = {
  save(button) {
    const story = findStory(button.dataset.id);
    if (!story) return;
    const isSaved = saved.toggle(story);
    button.classList.remove("pop");
    void button.offsetWidth; /* reinicia la animación */
    button.classList.add("pop");
    toast(isSaved ? "Guardada para leer después" : "Quitada de guardados", isSaved ? "ri-bookmark-fill" : "ri-bookmark-line");
  },
  "remove-saved"(button) {
    saved.remove(button.dataset.id);
  },
  share(button) {
    shareStory(findStory(button.dataset.id));
  },
  retry() {
    loadNews({ fresh: true });
  },
  "retry-article"() {
    retryArticle();
  },
  back() {
    goBack();
  },
  search() {
    openSearch();
  },
  "search-tag"(button) {
    openSearch(button.dataset.query);
  },
  saved() {
    openSaved();
  },
  "close-dialog"(button) {
    button.closest("dialog").close();
  },
  "load-more"() {
    loadMore();
  },
  "show-new"() {
    showNewStories();
  },
  "font-up"() {
    changeFontSize(1);
  },
  "font-down"() {
    changeFontSize(-1);
  },
};

function handleClick(event) {
  const actionEl = event.target.closest("[data-action]");
  if (actionEl && actions[actionEl.dataset.action]) {
    actions[actionEl.dataset.action](actionEl);
    return;
  }

  const sourceEl = event.target.closest("[data-source]");
  if (sourceEl) {
    sourceEl.closest("dialog")?.close();
    selectSource(sourceEl.dataset.source);
    return;
  }

  /* Clic fuera del contenido de un diálogo lo cierra */
  if (event.target instanceof HTMLDialogElement) event.target.close();
}

/*----------------- INICIO ----------------*/

function renderStaticParts() {
  const today = document.getElementById("today");
  today.textContent = formatToday(LOCALE);
  today.dateTime = new Date().toISOString().slice(0, 10);
  document.getElementById("footer-year").textContent = new Date().getFullYear();
  document.getElementById("footer-company").textContent = COMPANY_NAME;
  document.getElementById("footer-sources").innerHTML = SOURCES.map(
    (s) => `<li><a href="${escapeHTML(s.baseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.name)}</a></li>`
  ).join("");
}

function init() {
  renderStaticParts();
  initTheme(document.getElementById("theme-toggle"));
  initSaved();
  initSearch(getHomeNews);
  initScrollEffects({
    masthead: document.querySelector(".masthead"),
    backToTop: document.getElementById("back-to-top"),
  });
  startRelativeTimes();
  initArticle();

  document.addEventListener("click", handleClick);

  /* Si una imagen remota falla, se muestra el fondo de reemplazo */
  document.addEventListener(
    "error",
    (event) => {
      if (event.target instanceof HTMLImageElement) event.target.closest(".media")?.classList.add("media--empty");
    },
    true
  );

  loadIndicators();
  initHome();
  startRouter(onRoute);
}

init();
