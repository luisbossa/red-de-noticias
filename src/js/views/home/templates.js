/* Plantillas exclusivas de la portada */

import { card, listItem, mediumStory, meta, rankedItem, storyLink } from "../../components/story.js";
import { escapeHTML } from "../../lib/html.js";

function reveal(index) {
  return `reveal" style="--i:${index}`;
}

export function tickerItem(story) {
  return `<li class="ticker__item">${storyLink(story, escapeHTML(story.title))}</li>`;
}

export function opinionItem(story, index = 0) {
  return `
    <article class="opinion ${reveal(index)}">
      <i class="ri-double-quotes-l opinion__mark" aria-hidden="true"></i>
      <h3 class="opinion__title">${storyLink(story, escapeHTML(story.title))}</h3>
      ${story.author.name !== "Redacción" ? `<p class="opinion__author">${escapeHTML(story.author.name)}</p>` : ""}
      ${meta(story)}
    </article>`;
}

export function sectionBlock(section) {
  const [lead, ...others] = section.stories;
  let body;

  if (section.variant === "opinion") {
    body = `<div class="opinion-grid">${section.stories.map(opinionItem).join("")}</div>`;
  } else if (section.variant === "lead") {
    body = `
      <div class="section__lead-layout">
        ${mediumStory(lead)}
        <ul class="section__list">${others.map((story, i) => listItem(story, i + 1)).join("")}</ul>
      </div>`;
  } else {
    body = `<div class="news-grid">${section.stories.map(card).join("")}</div>`;
  }

  return `
    <section id="seccion-${escapeHTML(section.id)}" class="section section--${section.variant}">
      <header class="section__header">
        <h2 class="section-title">${escapeHTML(section.name)}</h2>
      </header>
      ${body}
    </section>`;
}

export function sourceColumn({ source, stories }, index) {
  return `
    <div class="source-col ${reveal(index)}">
      <header class="source-col__header">
        <h3 class="source-col__name">${escapeHTML(source.name)}</h3>
        <button class="link-button" type="button" data-source="${escapeHTML(source.id)}">
          Ver solo este medio <i class="ri-arrow-right-line" aria-hidden="true"></i>
        </button>
      </header>
      <ol class="ranked">${stories.map(rankedItem).join("")}</ol>
    </div>`;
}

export function sourceChip({ id, name }, active) {
  return `<button class="chip" type="button" data-source="${escapeHTML(id)}" aria-pressed="${active}">${escapeHTML(name)}</button>`;
}

export function navLink(href, label) {
  return `<li><a class="navbar__link" href="${href}">${escapeHTML(label)}</a></li>`;
}
