const STORAGE_KEY = "theme";
const root = document.documentElement;

function applyTheme(theme, button) {
  root.dataset.theme = theme;
  const isDark = theme === "dark";
  button.setAttribute("aria-pressed", String(isDark));
  button.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}

export function initTheme(button) {
  applyTheme(root.dataset.theme === "dark" ? "dark" : "light", button);

  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next, button);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* almacenamiento no disponible: el tema solo dura esta visita */
    }
  });
}
