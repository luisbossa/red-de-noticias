/* Minúsculas y sin tildes, para comparar y buscar */
export function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function countWords(text = "") {
  return text.split(/\s+/).filter(Boolean).length;
}
