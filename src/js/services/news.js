import { CACHE_TTL_MS, PER_SOURCE } from "../config/settings.js";
import { classify, isExcluded } from "./classify.js";
import { fetchWordPress, fetchWordPressArticle } from "./wordpress.js";

/* Un adaptador por formato de API; todos devuelven el mismo modelo de nota */
const adapters = {
  wordpress: { list: fetchWordPress, article: fetchWordPressArticle },
};

const listCache = new Map();
const articleCache = new Map();

function adapterFor(source) {
  const adapter = adapters[source.type];
  if (!adapter) throw new Error(`Tipo de fuente desconocido: ${source.type}`);
  return adapter;
}

async function fetchSource(source, { signal, fresh }) {
  const cached = listCache.get(source.id);
  if (!fresh && cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.items;

  const items = (await adapterFor(source).list(source, { signal, limit: PER_SOURCE }))
    .filter((story) => !isExcluded(story.categories))
    .map((story) => ({ ...story, ...classify(story.categories) }));
  listCache.set(source.id, { at: Date.now(), items });
  return items;
}

/* Pide todas las fuentes en paralelo. Si alguna falla se informa en `failed`
   y se sigue con las demás; solo se lanza error si fallan todas. */
export async function fetchNews(sources, { signal, fresh = false } = {}) {
  const results = await Promise.allSettled(sources.map((source) => fetchSource(source, { signal, fresh })));
  if (signal?.aborted) throw new DOMException("Petición cancelada", "AbortError");

  const news = [];
  const failed = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      news.push(...result.value);
    } else {
      console.warn(`No se pudo obtener ${sources[i].name}:`, result.reason);
      failed.push(sources[i]);
    }
  });

  if (news.length === 0 && failed.length > 0) {
    const error = new Error("No se pudo cargar ninguna fuente");
    error.failed = failed;
    throw error;
  }

  /* Más recientes primero; las que no tienen fecha conocida van al final */
  news.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  return { news, failed };
}

/* Nota completa (texto, etiquetas, fecha de actualización) */
export async function fetchArticle(source, postId, { signal } = {}) {
  const key = `${source.id}-${postId}`;
  if (articleCache.has(key)) return articleCache.get(key);

  const article = await adapterFor(source).article(source, postId, { signal });
  const result = { ...article, ...classify(article.categories) };
  articleCache.set(key, result);
  return result;
}
