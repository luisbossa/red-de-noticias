/* Vista de una nota dentro de la app: texto completo, ficha, fuente original y relacionadas */

import { observeReveal } from "../../components/effects.js";
import { APP_NAME, RELATED_COUNT } from "../../config/settings.js";
import { getSource, SOURCES } from "../../config/sources.js";
import { readingMinutes } from "../../lib/format.js";
import { sanitizeArticle } from "../../lib/sanitize.js";
import { countWords } from "../../lib/text.js";
import { fetchArticle, fetchNews } from "../../services/news.js";
import { saved } from "../../store/saved.js";
import { getStory, registerStories } from "../../store/stories.js";
import {
  articleErrorTemplate,
  articleSkeleton,
  articleTemplate,
  moreFromSource,
  relatedCards,
} from "./templates.js";

const FONT_KEY = "article-font";
const FONT_STEPS = [1, 1.0625, 1.125, 1.25, 1.375];
const DEFAULT_FONT_STEP = 2;

const els = {
  view: document.getElementById("article-view"),
  root: document.getElementById("article-root"),
  progress: document.getElementById("reading-progress"),
};

let controller;
let currentRoute;
let fontStep = readFontStep();

/*----------------- TAMAÑO DE LETRA ----------------*/

function readFontStep() {
  try {
    const saved = localStorage.getItem(FONT_KEY);
    const step = Number(saved);
    return saved !== null && FONT_STEPS[step] ? step : DEFAULT_FONT_STEP;
  } catch {
    return DEFAULT_FONT_STEP;
  }
}

function applyFontStep() {
  els.view.style.setProperty("--article-size", `${FONT_STEPS[fontStep]}rem`);
}

export function changeFontSize(delta) {
  fontStep = Math.min(FONT_STEPS.length - 1, Math.max(0, fontStep + delta));
  applyFontStep();
  try {
    localStorage.setItem(FONT_KEY, String(fontStep));
  } catch {
    /* sin almacenamiento */
  }
}

/*----------------- PROGRESO DE LECTURA ----------------*/

let progressFrame = 0;

function updateProgress() {
  progressFrame = 0;
  const body = els.root.querySelector(".article__body");
  if (els.view.hidden || !body) {
    els.progress.style.setProperty("--progress", 0);
    return;
  }
  const rect = body.getBoundingClientRect();
  const total = rect.height - window.innerHeight * 0.6;
  const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
  els.progress.style.setProperty("--progress", progress.toFixed(3));
}

function scheduleProgress() {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
}

/*----------------- NOTAS RELACIONADAS ----------------*/

function pickRelated(news, article) {
  const others = news.filter((story) => story.id !== article.id);
  const sameSection = article.section ? others.filter((story) => story.section === article.section) : [];
  const sameSource = others.filter((story) => story.source.id === article.source.id);

  const related = [...new Map([...sameSection, ...sameSource].map((story) => [story.id, story])).values()];
  return {
    related: related.slice(0, RELATED_COUNT),
    fromSource: sameSource.slice(0, 5),
  };
}

async function loadRelated(article, signal) {
  try {
    /* Usa la caché de la portada; si se entró directo a la nota, la pide */
    const { news } = await fetchNews(SOURCES, { signal });
    if (signal.aborted) return;
    registerStories(news);

    const { related, fromSource } = pickRelated(news, article);
    const moreList = els.root.querySelector("#article-more-source");
    if (moreList) moreList.innerHTML = moreFromSource(fromSource);

    const section = els.root.querySelector("#article-related-section");
    if (section && related.length) {
      section.querySelector("#article-related").innerHTML = relatedCards(related);
      section.hidden = false;
      observeReveal(section);
    }
  } catch {
    /* sin relacionadas no pasa nada */
  }
}

/*----------------- CARGA ----------------*/

export async function showArticle(route) {
  currentRoute = route;
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  els.view.hidden = false;
  applyFontStep();
  window.scrollTo({ top: 0, behavior: "instant" });

  const source = getSource(route.sourceId);
  const id = `${route.sourceId}-${route.postId}`;
  const preview = getStory(id) ?? saved.get(id);

  if (!source) {
    els.root.innerHTML = articleErrorTemplate(null);
    return;
  }

  els.root.innerHTML = preview ? articleTemplate(preview, { loading: true }) : articleSkeleton;
  if (preview) document.title = `${preview.title} · ${APP_NAME}`;
  updateProgress();

  try {
    const article = await fetchArticle(source, route.postId, { signal });
    const { html, text } = sanitizeArticle(article.content, article.url || source.baseUrl);
    const words = countWords(text);
    const full = { ...article, body: html, words, minutes: readingMinutes(words) };
    if (signal.aborted) return;

    registerStories([full]);
    els.root.innerHTML = articleTemplate(full);
    document.title = `${full.title} · ${APP_NAME}`;
    updateProgress();
    loadRelated(full, signal);
  } catch (error) {
    if (signal.aborted) return;
    console.error("Error al obtener la nota:", error);
    els.root.innerHTML = articleErrorTemplate(preview);
  }
}

export function retryArticle() {
  if (currentRoute) showArticle(currentRoute);
}

export function hideArticle() {
  controller?.abort();
  els.view.hidden = true;
  els.root.innerHTML = "";
  els.progress.style.setProperty("--progress", 0);
}

export function initArticle() {
  window.addEventListener("scroll", scheduleProgress, { passive: true });
  window.addEventListener("resize", scheduleProgress, { passive: true });
}
