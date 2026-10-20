import { saved } from "../store/saved.js";
import { emptyListTemplate } from "../components/states.js";
import { compactStory } from "../components/story.js";

const els = {
  dialog: document.getElementById("saved-dialog"),
  list: document.getElementById("saved-list"),
  count: document.getElementById("saved-count"),
};

function render(items) {
  els.count.textContent = items.length;
  els.count.hidden = items.length === 0;

  els.list.innerHTML = items.length
    ? items.map((story) => compactStory(story, { removable: true })).join("")
    : emptyListTemplate(
        "ri-bookmark-line",
        "Todavía no guardaste noticias",
        "Tocá el marcador de cualquier nota para leerla después."
      );

  /* Mantiene sincronizados los marcadores de toda la página */
  document.querySelectorAll('[data-action="save"]').forEach((button) => {
    button.setAttribute("aria-pressed", String(saved.has(button.dataset.id)));
  });
}

export function openSaved() {
  els.dialog.showModal();
}

export function initSaved() {
  saved.subscribe(render);
}
