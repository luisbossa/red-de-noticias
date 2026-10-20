import { decodeEntities, safeUrl } from "../lib/html.js";
import { getJSON } from "./http.js";

/* Solo pedimos los campos que usamos para que la respuesta sea más liviana.
   Las categorías NO se incrustan (_embed=wp:term): en algunos medios eso trae
   todas las etiquetas con descripciones y la respuesta pasa de ~150 KB a ~2 MB.
   En su lugar se piden aparte solo los nombres de las categorías y etiquetas usadas. */
const LIST_FIELDS = "id,date_gmt,link,title,excerpt,categories,_links,_embedded";
const ARTICLE_FIELDS = "id,date_gmt,modified_gmt,link,title,excerpt,content,categories,tags,_links,_embedded";
const EMBED = "author,wp:featuredmedia";

/* id → nombre, por medio y taxonomía (casi nunca cambian) */
const termNames = new Map();

/*----------------- LISTA DE NOTAS ----------------*/

export async function fetchWordPress(source, { signal, limit }) {
  const url = new URL("/wp-json/wp/v2/posts", source.baseUrl);
  url.search = new URLSearchParams({ per_page: limit, _embed: EMBED, _fields: LIST_FIELDS });

  const posts = await getJSON(url, { signal });
  const ids = posts.flatMap((post) => post.categories ?? []);
  const categories = await fetchTermNames(source, "categories", ids, { signal });
  return posts.map((post) => normalizePost(post, source, categories));
}

/*----------------- NOTA COMPLETA ----------------*/

export async function fetchWordPressArticle(source, postId, { signal } = {}) {
  const url = new URL(`/wp-json/wp/v2/posts/${encodeURIComponent(postId)}`, source.baseUrl);
  url.search = new URLSearchParams({ _embed: EMBED, _fields: ARTICLE_FIELDS });

  const post = await getJSON(url, { signal });
  const [categories, tags] = await Promise.all([
    fetchTermNames(source, "categories", post.categories ?? [], { signal }),
    fetchTermNames(source, "tags", post.tags ?? [], { signal }),
  ]);
  const media = post._embedded?.["wp:featuredmedia"]?.[0];

  return {
    ...normalizePost(post, source, categories),
    content: post.content?.rendered ?? "",
    modifiedAt: post.modified_gmt ? new Date(`${post.modified_gmt}Z`) : null,
    tags: (post.tags ?? []).map((id) => tags.get(id)).filter(Boolean),
    imageCaption: decodeEntities(media?.caption?.rendered),
  };
}

/*----------------- AUXILIARES ----------------*/

async function fetchTermNames(source, taxonomy, ids, { signal }) {
  const key = `${source.id}:${taxonomy}`;
  if (!termNames.has(key)) termNames.set(key, new Map());
  const names = termNames.get(key);

  const missing = [...new Set(ids)].filter((id) => !names.has(id));
  if (missing.length === 0) return names;

  try {
    const url = new URL(`/wp-json/wp/v2/${taxonomy}`, source.baseUrl);
    url.search = new URLSearchParams({ include: missing.join(","), per_page: 100, _fields: "id,name" });
    const terms = await getJSON(url, { signal });
    terms.forEach((term) => names.set(term.id, decodeEntities(term.name)));
  } catch (error) {
    /* Sin nombres las notas igual se muestran, solo sin sección o etiquetas */
    if (signal?.aborted) throw error;
    console.warn(`Sin ${taxonomy} de ${source.name}:`, error);
  }
  return names;
}

function normalizePost(post, source, categoryNames) {
  const embedded = post._embedded ?? {};
  const author = embedded.author?.[0];
  const media = embedded["wp:featuredmedia"]?.[0];

  return {
    id: `${source.id}-${post.id}`,
    postId: String(post.id),
    title: decodeEntities(post.title?.rendered) || "Sin título",
    excerpt: decodeEntities(post.excerpt?.rendered),
    url: safeUrl(post.link),
    img: imageUrl(media, ["large", "medium_large", "full"]),
    thumb: imageUrl(media, ["medium_large", "medium", "large", "full"]),
    /* date_gmt viene sin zona horaria: se marca como UTC */
    publishedAt: post.date_gmt ? new Date(`${post.date_gmt}Z`) : null,
    author: {
      name: decodeEntities(author?.name) || "Redacción",
      url: safeUrl(author?.link),
    },
    categories: (post.categories ?? []).map((id) => categoryNames.get(id)).filter(Boolean),
    source,
  };
}

function imageUrl(media, sizes) {
  const available = media?.media_details?.sizes ?? {};
  const size = sizes.find((name) => available[name]?.source_url);
  return safeUrl(size ? available[size].source_url : media?.source_url);
}
