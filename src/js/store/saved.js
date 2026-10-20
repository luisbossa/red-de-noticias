/* Noticias guardadas para leer después (localStorage) */

const KEY = "saved-stories";
const listeners = new Set();

let items = load();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY)) ?? [];
    return raw.map((item) => ({
      ...item,
      /* Las guardadas con versiones anteriores no tenían postId */
      postId: item.postId ?? item.id.slice(item.source.id.length + 1),
      author: item.author ?? { name: "Redacción", url: "" },
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
    }));
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* sin almacenamiento: se mantienen solo en esta visita */
  }
  listeners.forEach((fn) => fn(items));
}

/* Solo se guarda lo necesario para mostrar la nota en la lista y abrirla */
function snapshot(story) {
  return {
    id: story.id,
    postId: story.postId,
    title: story.title,
    excerpt: story.excerpt,
    url: story.url,
    img: story.img,
    thumb: story.thumb,
    category: story.category,
    publishedAt: story.publishedAt,
    author: story.author,
    source: { id: story.source.id, name: story.source.name },
    savedAt: new Date().toISOString(),
  };
}

export const saved = {
  all: () => items,
  get: (id) => items.find((item) => item.id === id),
  has: (id) => items.some((item) => item.id === id),

  /* Devuelve true si quedó guardada */
  toggle(story) {
    if (this.has(story.id)) {
      items = items.filter((item) => item.id !== story.id);
      persist();
      return false;
    }
    items = [snapshot(story), ...items];
    persist();
    return true;
  },

  remove(id) {
    items = items.filter((item) => item.id !== id);
    persist();
  },

  subscribe(fn) {
    listeners.add(fn);
    fn(items);
  },
};
