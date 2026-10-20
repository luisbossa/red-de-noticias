/* "hace 5 minutos", "hace 3 horas" o, si es más vieja, "19 oct, 7:29 p. m." */
export function formatPublished(date, locale) {
  const minutes = Math.round((date.getTime() - Date.now()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(minutes) < 60 * 24) return rtf.format(Math.round(minutes / 60), "hour");

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/* "lunes 20 de octubre de 2026, 10:08 a. m." */
export function formatLongDate(date, locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }).format(date);
}

export function formatClock(date, locale) {
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatToday(locale) {
  const text = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* Minutos de lectura estimados (~200 palabras por minuto) */
export function readingMinutes(words) {
  return Math.max(1, Math.round(words / 200));
}
