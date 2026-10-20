import { escapeHTML } from "../lib/html.js";

export const featuredSkeleton = `
  <div class="featured skeleton" aria-hidden="true">
    <div class="media"></div>
    <div class="featured__body">
      <span class="skeleton__line skeleton__line--short"></span>
      <span class="skeleton__line skeleton__line--title"></span>
      <span class="skeleton__line skeleton__line--title"></span>
      <span class="skeleton__line skeleton__line--short"></span>
    </div>
  </div>`;

export const storySkeleton = `
  <div class="story skeleton" aria-hidden="true">
    <div class="media"></div>
    <div class="story__body">
      <span class="skeleton__line"></span>
      <span class="skeleton__line skeleton__line--short"></span>
    </div>
  </div>`;

export const latestSkeleton = `
  <li class="latest__item skeleton" aria-hidden="true">
    <span class="latest__rank">··</span>
    <div class="latest__text">
      <span class="skeleton__line"></span>
      <span class="skeleton__line skeleton__line--short"></span>
    </div>
    <div class="latest__thumb"><div class="media"></div></div>
  </li>`;

export const cardSkeleton = `
  <div class="card skeleton" aria-hidden="true">
    <div class="card__media"><div class="media"></div></div>
    <div class="card__body">
      <span class="skeleton__line"></span>
      <span class="skeleton__line skeleton__line--short"></span>
    </div>
  </div>`;

export function errorTemplate({ showAll = false } = {}) {
  return `
    <div class="status__box">
      <i class="ri-signal-wifi-error-line status__icon" aria-hidden="true"></i>
      <h2 class="status__title">No pudimos cargar las noticias</h2>
      <p>${showAll ? "Este medio no está respondiendo en este momento." : "Revisá tu conexión o intentá de nuevo en unos minutos."}</p>
      <div class="status__actions">
        <button class="button" type="button" data-action="retry">
          <i class="ri-refresh-line" aria-hidden="true"></i> Reintentar
        </button>
        ${showAll ? `<button class="button button--ghost" type="button" data-source="all">Ver todos los medios</button>` : ""}
      </div>
    </div>`;
}

export function emptyTemplate() {
  return `
    <div class="status__box">
      <i class="ri-newspaper-line status__icon" aria-hidden="true"></i>
      <h2 class="status__title">No hay noticias por ahora</h2>
      <p>Volvé a revisar en un rato.</p>
    </div>`;
}

export function emptyListTemplate(icon, title, text) {
  return `
    <li class="empty-list">
      <i class="${escapeHTML(icon)}" aria-hidden="true"></i>
      <p class="empty-list__title">${escapeHTML(title)}</p>
      <p>${escapeHTML(text)}</p>
    </li>`;
}
