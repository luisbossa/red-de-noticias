import { safeUrl } from "./html.js";

/* Limpia el HTML de un artículo externo con una lista blanca:
   - solo pasan etiquetas de texto (párrafos, títulos, listas, citas, tablas, imágenes)
   - se eliminan scripts, anuncios, formularios y todos los atributos (style, class, on*...)
   - los <div>/<span> se desenvuelven; un <div> que solo tiene texto pasa a ser <p>
   - solo se permiten videos incrustados de YouTube (modo privacidad) y Vimeo
   Se trabaja sobre un documento inerte: nada se ejecuta ni se descarga mientras se limpia. */

const ALLOWED = new Set([
  "p", "h2", "h3", "h4", "h5", "h6", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "figure",
  "figcaption", "img", "br", "hr", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "sup", "sub",
  "small", "cite", "q", "code", "pre",
]);
const RENAME = { h1: "h2", b: "strong", i: "em", strike: "s", del: "s" };
const DROP = new Set([
  "script", "style", "noscript", "ins", "form", "input", "button", "select", "textarea", "object", "embed", "svg",
  "link", "meta", "template", "audio", "video", "canvas", "aside", "nav",
]);
const CONTAINERS = new Set(["div", "section", "article", "main", "header", "footer"]);
const BLOCKS = "p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, figure, table, div, section, article, iframe, img";

export function sanitizeArticle(html, baseUrl) {
  const parsed = new DOMParser().parseFromString(String(html), "text/html");
  const doc = document.implementation.createHTMLDocument("");
  const root = doc.createElement("div");

  appendClean(parsed.body, root, doc, baseUrl);

  /* Párrafos vacíos que dejan los editores */
  root.querySelectorAll("p").forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector("img, iframe")) p.remove();
  });

  return { html: root.innerHTML, text: root.textContent.trim() };
}

function appendClean(node, parent, doc, base) {
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      parent.append(doc.createTextNode(child.textContent));
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const tag = child.tagName.toLowerCase();
    if (DROP.has(tag)) continue;

    if (tag === "iframe") {
      const embed = cleanEmbed(child, doc);
      if (embed) parent.append(embed);
      continue;
    }

    if (CONTAINERS.has(tag)) {
      if (child.querySelector(BLOCKS)) {
        appendClean(child, parent, doc, base);
      } else if (child.textContent.trim()) {
        const p = doc.createElement("p");
        appendClean(child, p, doc, base);
        parent.append(p);
      }
      continue;
    }

    const name = RENAME[tag] ?? tag;
    if (!ALLOWED.has(name)) {
      appendClean(child, parent, doc, base);
      continue;
    }

    if (name === "img") {
      const src = resolve(pickImageSource(child), base);
      if (src) {
        const img = doc.createElement("img");
        img.src = src;
        img.alt = child.getAttribute("alt") ?? "";
        img.loading = "lazy";
        img.decoding = "async";
        parent.append(img);
      }
      continue;
    }

    const el = doc.createElement(name);
    if (name === "a") {
      const href = resolve(child.getAttribute("href"), base);
      if (!href) {
        appendClean(child, parent, doc, base);
        continue;
      }
      el.href = href;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
    if ((name === "td" || name === "th") && child.hasAttribute("colspan")) {
      el.colSpan = Math.min(Number(child.getAttribute("colspan")) || 1, 12);
    }

    appendClean(child, el, doc, base);
    parent.append(el);
  }
}

/* Los sitios con carga diferida guardan la imagen real en data-src */
function pickImageSource(img) {
  const candidates = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
  return candidates.find((value) => value && !value.startsWith("data:"));
}

function resolve(value, base) {
  if (!value) return "";
  try {
    return safeUrl(new URL(value, base).href);
  } catch {
    return "";
  }
}

function cleanEmbed(iframe, doc) {
  let url;
  try {
    url = new URL(iframe.getAttribute("src") ?? "", "https://invalid.local");
  } catch {
    return null;
  }

  let src = "";
  const host = url.hostname.replace(/^www\./, "");
  if ((host === "youtube.com" || host === "youtube-nocookie.com") && url.pathname.startsWith("/embed/")) {
    src = `https://www.youtube-nocookie.com${url.pathname}`;
  } else if (host === "player.vimeo.com" && url.pathname.startsWith("/video/")) {
    src = `https://player.vimeo.com${url.pathname}`;
  }
  if (!src) return null;

  const wrapper = doc.createElement("div");
  wrapper.className = "embed";
  const frame = doc.createElement("iframe");
  frame.src = src;
  frame.title = iframe.getAttribute("title") || "Video";
  frame.loading = "lazy";
  frame.allow = "accelerometer; encrypted-media; picture-in-picture; fullscreen";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  wrapper.append(frame);
  return wrapper;
}
