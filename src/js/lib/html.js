const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/* Escapa texto antes de insertarlo en una plantilla HTML */
export function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/* Convierte entidades HTML (&#8220;, &amp;...) en texto plano.
   DOMParser no ejecuta scripts, así que es seguro para contenido externo. */
export function decodeEntities(value = "") {
  const doc = new DOMParser().parseFromString(String(value), "text/html");
  return doc.documentElement.textContent.trim();
}

/* Solo permite enlaces http(s); cualquier otra cosa se descarta */
export function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}
