import { SECTIONS } from "../../config/sections.js";
import { LATEST_COUNT } from "../../config/settings.js";

/* Reparte las noticias en las zonas de la portada sin repetirlas
   (excepto "Última hora" y "Por medio", que son vistas alternativas) */
export function buildLayout(news, { sources }) {
  const used = new Set();
  const take = (pool, count) => {
    const picked = pool.filter((story) => !used.has(story.id)).slice(0, count);
    picked.forEach((story) => used.add(story.id));
    return picked;
  };

  const withImage = news.filter((story) => story.img);
  const [featured] = take(withImage.length ? withImage : news, 1);
  const secondary = take(withImage, 2);
  const latest = take(news, LATEST_COUNT);

  let layoutIndex = 0;
  const sections = [];
  for (const section of SECTIONS) {
    const pool = news.filter((story) => story.section === section.id && !used.has(story.id));
    if (pool.length < 3) continue;

    const variant = section.variant ?? (layoutIndex++ % 2 === 0 ? "lead" : "cards");
    const limit = variant === "lead" ? 5 : 4;
    const stories = take(pool, limit);

    /* La nota grande de la sección debe tener foto si alguna la tiene */
    const withPhoto = stories.findIndex((story) => story.img);
    if (variant === "lead" && withPhoto > 0) stories.unshift(...stories.splice(withPhoto, 1));

    sections.push({ ...section, variant, stories });
  }

  const bySource = sources
    .map((source) => ({ source, stories: news.filter((story) => story.source.id === source.id).slice(0, 5) }))
    .filter((group) => group.stories.length > 0);

  return {
    ticker: news.slice(0, 10),
    featured,
    secondary,
    latest,
    sections,
    bySource: bySource.length > 1 ? bySource : [],
    rest: news.filter((story) => !used.has(story.id)),
  };
}
