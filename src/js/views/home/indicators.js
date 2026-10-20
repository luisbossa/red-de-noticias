import { fetchExchangeRate, fetchWeather } from "../../services/indicators.js";
import { LOCALE } from "../../config/settings.js";
import { formatClock } from "../../lib/format.js";
import { escapeHTML } from "../../lib/html.js";

const els = {
  weather: document.getElementById("indicator-weather"),
  exchange: document.getElementById("indicator-exchange"),
  summary: document.getElementById("indicator-summary"),
};

/* Códigos WMO de Open-Meteo → texto e ícono */
function describeWeather(code, isDay) {
  if (code === 0) return ["Despejado", isDay ? "ri-sun-line" : "ri-moon-clear-line"];
  if (code <= 2) return ["Parcialmente nublado", isDay ? "ri-sun-cloudy-line" : "ri-moon-cloudy-line"];
  if (code === 3) return ["Nublado", "ri-cloudy-line"];
  if (code <= 48) return ["Neblina", "ri-mist-line"];
  if (code <= 57) return ["Llovizna", "ri-drizzle-line"];
  if (code <= 67 || (code >= 80 && code <= 82)) return ["Lluvia", "ri-showers-line"];
  if (code >= 95) return ["Tormenta", "ri-thunderstorms-line"];
  return ["Variable", "ri-cloudy-2-line"];
}

function indicator({ icon, label, value, detail }) {
  return `
    <i class="${icon} indicator__icon" aria-hidden="true"></i>
    <div class="indicator__text">
      <p class="indicator__label">${label}</p>
      <p class="indicator__value">${value}</p>
      <p class="indicator__detail">${detail}</p>
    </div>`;
}

function show(el, html) {
  el.innerHTML = html;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add("is-visible"));
}

async function loadWeather() {
  try {
    const w = await fetchWeather();
    const [text, icon] = describeWeather(w.code, w.isDay);
    show(
      els.weather,
      indicator({
        icon,
        label: `Clima · ${escapeHTML(w.city)}`,
        value: `${Math.round(w.temperature)}° <span>${text}</span>`,
        detail: `Máx ${Math.round(w.max)}° · Mín ${Math.round(w.min)}°`,
      })
    );
  } catch (error) {
    console.warn("Clima no disponible:", error);
  }
}

async function loadExchange() {
  try {
    const rate = await fetchExchangeRate();
    const colones = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "CRC" });
    show(
      els.exchange,
      indicator({
        icon: "ri-exchange-dollar-line",
        label: "Tipo de cambio · USD",
        value: `${colones.format(rate.sell)} <span>venta</span>`,
        detail: `Compra ${colones.format(rate.buy)} · Hacienda`,
      })
    );
  } catch (error) {
    console.warn("Tipo de cambio no disponible:", error);
  }
}

export function loadIndicators() {
  loadWeather();
  loadExchange();
}

export function updateSummary(news) {
  const sources = new Set(news.map((story) => story.source.id)).size;
  show(
    els.summary,
    indicator({
      icon: "ri-newspaper-line",
      label: "Hoy en la Red",
      value: `${news.length} <span>noticias</span>`,
      detail: `De ${sources} ${sources === 1 ? "medio" : "medios"} · ${formatClock(new Date(), LOCALE)}`,
    })
  );
}
