/* Piezas y variantes de nota compartidas por portada, búsqueda, guardados y vista de nota.
   Los enlaces de las notas llevan a la vista interna (#/noticia/...), nunca al medio original. */

import { LOCALE } from "../config/settings.js";
import { formatPublished } from "../lib/format.js";
import { escapeHTML } from "../lib/html.js";
import { articleHref } from "../router.js";
import { saved } from "../store/saved.js";

/*----------------- PIEZAS ----------------*/

export function media(src, { eager = false } = {}) {
  if (!src) return `<div class="media media--empty" aria-hidden="true"></div>`;
  return `
    <div class="media">
      <img src="${escapeHTML(src)}" alt="" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
    </div>`;
}

export function storyLink(story, content, className = "") {
  return `<a class="${className}" href="${articleHref(story)}">${content}</a>`;
}

export function tag(story) {
  return story.category ? `<span class="tag">${escapeHTML(story.category)}</span>` : "";
}

export function time(story) {
  if (!story.publishedAt) return "";
  return `<time class="meta__time" datetime="${story.publishedAt.toISOString()}" data-relative><i class="ri-time-line" aria-hidden="true"></i><span>${escapeHTML(
    formatPublished(story.publishedAt, LOCALE)
  )}</span></time>`;
}

export function meta(story) {
  return `<div class="meta"><span class="meta__source">${escapeHTML(story.source.name)}</span>${time(story)}</div>`;
}

export function saveButton(story, { label = false } = {}) {
  return `
    <button class="action-button${label ? " action-button--label" : ""}" type="button" data-action="save" data-id="${escapeHTML(story.id)}"
      aria-pressed="${saved.has(story.id)}" aria-label="Guardar para leer después" title="Guardar">
      <i class="ri-bookmark-line icon-off" aria-hidden="true"></i>
      <i class="ri-bookmark-fill icon-on" aria-hidden="true"></i>
      ${label ? `<span class="icon-off">Guardar</span><span class="icon-on">Guardada</span>` : ""}
    </button>`;
}

export function shareButton(story, { label = false } = {}) {
  return `
    <button class="action-button${label ? " action-button--label" : ""}" type="button" data-action="share" data-id="${escapeHTML(story.id)}"
      aria-label="Compartir" title="Compartir">
      <i class="ri-share-forward-line" aria-hidden="true"></i>${label ? "<span>Compartir</span>" : ""}
    </button>`;
}

export function actions(story) {
  return `<div class="story-actions">${saveButton(story)}${shareButton(story)}</div>`;
}

function reveal(index) {
  return `reveal" style="--i:${index}`;
}

/*----------------- VARIANTES ----------------*/

export function featuredStory(story) {
  return `
    <article class="featured">
      ${storyLink(story, media(story.img, { eager: true }), "featured__media")}
      <div class="featured__body">
        <div class="featured__top">${tag(story)}${actions(story)}</div>
        <h2 class="featured__title">${storyLink(story, escapeHTML(story.title))}</h2>
        ${story.excerpt ? `<p class="featured__excerpt">${escapeHTML(story.excerpt)}</p>` : ""}
        <div class="meta">
          <span class="meta__author"><i class="ri-quill-pen-line" aria-hidden="true"></i>Por ${escapeHTML(story.author.name)}</span>
          <span class="meta__source">${escapeHTML(story.source.name)}</span>${time(story)}
        </div>
        <a class="button" href="${articleHref(story)}">Leer la nota <i class="ri-arrow-right-line" aria-hidden="true"></i></a>
      </div>
    </article>`;
}

/* Nota con imagen y título mediano: secundarias de portada y principal de sección */
export function mediumStory(story, index = 0) {
  return `
    <article class="story ${reveal(index)}">
      ${storyLink(story, media(story.thumb), "story__media")}
      <div class="story__body">
        <div class="story__top">${tag(story)}${actions(story)}</div>
        <h3 class="story__title">${storyLink(story, escapeHTML(story.title))}</h3>
        ${story.excerpt ? `<p class="story__excerpt">${escapeHTML(story.excerpt)}</p>` : ""}
        ${meta(story)}
      </div>
    </article>`;
}

export function latestItem(story, index) {
  return `
    <li class="latest__item ${reveal(index)}">
      <span class="latest__rank" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
      <div class="latest__text">
        ${tag(story)}
        <h3 class="latest__title">${storyLink(story, escapeHTML(story.title))}</h3>
        ${meta(story)}
      </div>
      ${storyLink(story, media(story.thumb), "latest__thumb")}
    </li>`;
}

export function card(story, index = 0) {
  return `
    <article class="card ${reveal(index)}">
      ${storyLink(story, media(story.thumb), "card__media")}
      <div class="card__body">
        <div class="story__top">${tag(story)}${actions(story)}</div>
        <h3 class="card__title">${storyLink(story, escapeHTML(story.title))}</h3>
        ${story.excerpt ? `<p class="card__excerpt">${escapeHTML(story.excerpt)}</p>` : ""}
        ${meta(story)}
      </div>
    </article>`;
}

export function listItem(story, index = 0) {
  return `
    <li class="list-item ${reveal(index)}">
      ${storyLink(story, media(story.thumb), "list-item__thumb")}
      <div class="list-item__text">
        <h3 class="list-item__title">${storyLink(story, escapeHTML(story.title))}</h3>
        ${meta(story)}
      </div>
    </li>`;
}

/* Lista numerada sin imagen ("Por medio", columna lateral de la nota) */
export function rankedItem(story, index) {
  return `
    <li class="ranked__item">
      <span class="ranked__rank" aria-hidden="true">${index + 1}</span>
      <div>
        <h4 class="ranked__title">${storyLink(story, escapeHTML(story.title))}</h4>
        <div class="meta">${time(story)}</div>
      </div>
    </li>`;
}

/* Resultado de búsqueda o nota guardada */
export function compactStory(story, { removable = false } = {}) {
  return `
    <li class="compact">
      ${storyLink(story, media(story.thumb), "compact__thumb")}
      <div class="compact__text">
        ${tag(story)}
        <h3 class="compact__title">${storyLink(story, escapeHTML(story.title))}</h3>
        ${meta(story)}
      </div>
      ${removable
        ? `<button class="action-button" type="button" data-action="remove-saved" data-id="${escapeHTML(story.id)}"
             aria-label="Quitar de guardados" title="Quitar"><i class="ri-close-line" aria-hidden="true"></i></button>`
        : ""}
    </li>`;
}
