/* Router por hash:
   #/noticia/<medio>/<id>  → vista de una nota
   cualquier otro (#/, #seccion-x, vacío) → portada (y si es un ancla, se desplaza a ella) */

const ARTICLE_ROUTE = /^#\/noticia\/([\w-]+)\/(\d+)\/?$/;

export function articleHref(story) {
  return `#/noticia/${encodeURIComponent(story.source.id)}/${encodeURIComponent(story.postId)}`;
}

export function parseRoute(hash = location.hash) {
  const match = hash.match(ARTICLE_ROUTE);
  if (match) return { name: "article", sourceId: match[1], postId: match[2] };

  const anchor = hash.length > 1 && !hash.startsWith("#/") ? decodeURIComponent(hash.slice(1)) : null;
  return { name: "home", anchor };
}

export function startRouter(onRoute) {
  window.addEventListener("hashchange", () => onRoute(parseRoute()));
  onRoute(parseRoute());
}
