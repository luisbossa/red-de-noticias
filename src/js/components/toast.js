import { escapeHTML } from "../lib/html.js";

const container = document.getElementById("toasts");

export function toast(message, icon = "ri-check-line") {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<i class="${escapeHTML(icon)}" aria-hidden="true"></i><span>${escapeHTML(message)}</span>`;
  container.append(el);

  setTimeout(() => {
    el.classList.add("is-leaving");
    el.addEventListener("animationend", () => el.remove(), { once: true });
    /* Respaldo por si las animaciones están desactivadas */
    setTimeout(() => el.remove(), 400);
  }, 2600);
}
