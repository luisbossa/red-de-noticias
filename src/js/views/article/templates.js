/* Plantillas de la vista de una nota */

import { card, media, rankedItem, saveButton, shareButton } from "../../components/story.js";
import { getSection } from "../../config/sections.js";
import { LOCALE } from "../../config/settings.js";
import { formatLongDate, formatPublished } from "../../lib/format.js";
import { escapeHTML } from "../../lib/html.js";

function externalLink(url, content, className = "") {
  return `<a class="${className}" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${content}</a>`;
}

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/*----------------- PIEZAS ----------------*/

function breadcrumb(article) {
  const section = getSection(article.section);
  return `
    <nav class="article__crumbs" aria-label="Ubicación">
      <button class="crumb-back" type="button" data-action="back">
        <i class="ri-arrow-left-line" aria-hidden="true"></i> Volver
      </button>
      <ol class="crumbs">
        <li><a href="#/">Portada</a></li>
        ${section ? `<li><a href="#seccion-${escapeHTML(section.id)}">${escapeHTML(section.name)}</a></li>` : ""}
        <li aria-current="page">${escapeHTML(article.source.name)}</li>
      </ol>
    </nav>`;
}

function byline(article) {
  const published = article.publishedAt
    ? `<time datetime="${article.publishedAt.toISOString()}" data-relative><i class="ri-time-line" aria-hidden="true"></i><span>${escapeHTML(
        formatPublished(article.publishedAt, LOCALE)
      )}</span></time>`
    : "";
  return `
    <div class="byline">
      <span class="byline__avatar" aria-hidden="true">${escapeHTML(initials(article.author.name))}</span>
      <div class="byline__text">
        <p class="byline__author">Por ${escapeHTML(article.author.name)} <span>· ${escapeHTML(article.source.name)}</span></p>
        <p class="byline__meta">
          ${published}
          ${article.minutes ? `<span><i class="ri-book-open-line" aria-hidden="true"></i>${article.minutes} min de lectura</span>` : ""}
        </p>
      </div>
    </div>`;
}

function toolbar(article) {
  return `
    <div class="article__toolbar">
      ${saveButton(article, { label: true })}
      ${shareButton(article, { label: true })}
      <div class="font-size" role="group" aria-label="Tamaño del texto">
        <button class="action-button font-size__down" type="button" data-action="font-down" aria-label="Achicar texto" title="Achicar texto">A</button>
        <button class="action-button font-size__up" type="button" data-action="font-up" aria-label="Agrandar texto" title="Agrandar texto">A</button>
      </div>
      ${article.url
        ? externalLink(
            article.url,
            `Ver en ${escapeHTML(article.source.name)} <i class="ri-external-link-line" aria-hidden="true"></i>`,
            "button button--ghost article__external"
          )
        : ""}
    </div>`;
}

function figure(article) {
  if (!article.img) return "";
  return `
    <figure class="article__figure">
      ${media(article.img, { eager: true })}
      ${article.imageCaption ? `<figcaption>${escapeHTML(article.imageCaption)}</figcaption>` : ""}
    </figure>`;
}

const bodySkeleton = `
  <div class="article__body-skeleton" aria-hidden="true">
    ${'<span class="skeleton__line"></span>'.repeat(4)}<span class="skeleton__line skeleton__line--short"></span>
    ${'<span class="skeleton__line"></span>'.repeat(3)}<span class="skeleton__line skeleton__line--short"></span>
  </div>`;

function tags(article) {
  if (!article.tags?.length) return "";
  return `
    <section class="article__tags" aria-labelledby="tags-title">
      <h2 id="tags-title" class="article__subhead">Etiquetas</h2>
      <div class="chips chips--wrap">
        ${article.tags
          .map(
            (name) =>
              `<button class="chip" type="button" data-action="search-tag" data-query="${escapeHTML(name)}"><i class="ri-hashtag" aria-hidden="true"></i>${escapeHTML(name)}</button>`
          )
          .join("")}
      </div>
    </section>`;
}

function sourceCard(article) {
  if (!article.url) return "";
  return `
    <section class="source-card">
      <i class="ri-newspaper-line source-card__icon" aria-hidden="true"></i>
      <div class="source-card__text">
        <p class="source-card__label">Fuente original</p>
        <p>Esta nota fue publicada por <strong>${escapeHTML(article.source.name)}</strong>. Para ver comentarios, galerías
          o contenido multimedia, visitá la publicación original.</p>
        <p class="source-card__url">${escapeHTML(hostname(article.url))}</p>
      </div>
      ${externalLink(article.url, `Ir a la nota original <i class="ri-external-link-line" aria-hidden="true"></i>`, "button")}
    </section>`;
}

function factRow(label, value) {
  return value ? `<div class="facts__row"><dt>${label}</dt><dd>${value}</dd></div>` : "";
}

function facts(article) {
  const section = getSection(article.section);
  const author = article.author.url
    ? externalLink(article.author.url, `${escapeHTML(article.author.name)} <i class="ri-external-link-line" aria-hidden="true"></i>`)
    : escapeHTML(article.author.name);
  const updated =
    article.modifiedAt && article.publishedAt && article.modifiedAt - article.publishedAt > 5 * 60 * 1000
      ? escapeHTML(formatLongDate(article.modifiedAt, LOCALE))
      : "";

  return `
    <section class="info-card">
      <h2 class="info-card__title"><i class="ri-file-list-3-line" aria-hidden="true"></i> Ficha de la nota</h2>
      <dl class="facts">
        ${factRow("Medio", externalLink(article.source.baseUrl, `${escapeHTML(article.source.name)} <i class="ri-external-link-line" aria-hidden="true"></i>`))}
        ${factRow("Autor", author)}
        ${factRow("Sección", section ? escapeHTML(section.name) : "")}
        ${factRow("Categorías", article.categories?.map(escapeHTML).join(", "))}
        ${factRow("Publicada", article.publishedAt ? escapeHTML(formatLongDate(article.publishedAt, LOCALE)) : "")}
        ${factRow("Actualizada", updated)}
        ${factRow("Extensión", article.words ? `${article.words.toLocaleString(LOCALE)} palabras · ${article.minutes} min` : "")}
      </dl>
    </section>`;
}

/*----------------- VISTA COMPLETA ----------------*/

/* Con `loading` se pinta lo que ya se conoce de la nota (título, foto, resumen)
   mientras llega el texto completo */
export function articleTemplate(article, { loading = false } = {}) {
  return `
    <article class="article">
      ${breadcrumb(article)}

      <header class="article__header">
        <div class="article__kicker">
          ${article.category ? `<span class="tag">${escapeHTML(article.category)}</span>` : ""}
          <span class="article__source-badge">${escapeHTML(article.source.name)}</span>
        </div>
        <h1 class="article__title">${escapeHTML(article.title)}</h1>
        ${article.excerpt ? `<p class="article__lead">${escapeHTML(article.excerpt)}</p>` : ""}
        ${byline(article)}
        ${toolbar(article)}
      </header>

      ${figure(article)}

      <div class="article__layout">
        <div class="article__main">
          ${loading ? bodySkeleton : `<div class="article__body prose">${article.body}</div>`}
          ${loading ? "" : tags(article)}
          ${sourceCard(article)}
        </div>

        <aside class="article__aside">
          ${loading ? "" : facts(article)}
          <section class="info-card">
            <h2 class="info-card__title"><i class="ri-flashlight-line" aria-hidden="true"></i> Lo último de ${escapeHTML(article.source.name)}</h2>
            <ol id="article-more-source" class="ranked"></ol>
          </section>
        </aside>
      </div>

      <section class="section related" id="article-related-section" hidden>
        <header class="section__header">
          <h2 class="section-title">Te puede interesar</h2>
        </header>
        <div id="article-related" class="news-grid"></div>
      </section>
    </article>`;
}

export const articleSkeleton = `
  <div class="article skeleton" aria-hidden="true">
    <div class="article__header">
      <span class="skeleton__line skeleton__line--short"></span>
      <span class="skeleton__line skeleton__line--title"></span>
      <span class="skeleton__line skeleton__line--title"></span>
      <span class="skeleton__line"></span>
    </div>
    <div class="article__figure"><div class="media"></div></div>
    ${bodySkeleton}
  </div>`;

export function articleErrorTemplate(preview) {
  return `
    <div class="status__box">
      <i class="ri-file-warning-line status__icon" aria-hidden="true"></i>
      <h2 class="status__title">No pudimos cargar esta nota</h2>
      <p>El medio no respondió o la nota ya no está disponible.</p>
      <div class="status__actions">
        <button class="button" type="button" data-action="retry-article"><i class="ri-refresh-line" aria-hidden="true"></i> Reintentar</button>
        ${preview?.url ? externalLink(preview.url, `Ver en el sitio original <i class="ri-external-link-line" aria-hidden="true"></i>`, "button button--ghost") : ""}
        <a class="button button--ghost" href="#/">Ir a la portada</a>
      </div>
    </div>`;
}

export function relatedCards(stories) {
  return stories.map((story, i) => card(story, i)).join("");
}

export function moreFromSource(stories) {
  return stories.map(rankedItem).join("");
}
