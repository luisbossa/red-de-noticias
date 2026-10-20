import { CATEGORY_LABELS, EXCLUDED_CATEGORIES, IGNORED_CATEGORIES, SECTIONS } from "../config/sections.js";
import { normalizeText } from "../lib/text.js";

const ignored = new Set(IGNORED_CATEGORIES);
const excluded = new Set(EXCLUDED_CATEGORIES);

const label = (name = "") => CATEGORY_LABELS[normalizeText(name)] ?? name;

/* true si la nota es contenido pagado */
export function isExcluded(categories = []) {
  return categories.some((name) => excluded.has(normalizeText(name)));
}

/* Elige la categoría que se muestra y la sección común a la que pertenece la nota.
   Se prefiere una sección específica (p. ej. Ambiente) sobre una genérica (Nacionales). */
export function classify(categories = []) {
  const useful = categories.filter((name) => name && !ignored.has(normalizeText(name)));

  const matches = useful
    .map((name) => ({ name, section: SECTIONS.find((s) => s.match.includes(normalizeText(name))) }))
    .filter((match) => match.section);
  const best = matches.find((match) => !match.section.generic) ?? matches[0];

  if (best) return { category: label(best.name), section: best.section.id };
  return { category: label(useful[0]), section: null };
}
