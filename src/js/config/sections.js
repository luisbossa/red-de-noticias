/* Cada medio nombra sus categorías distinto; aquí se agrupan en secciones comunes.
   `match` se compara en minúsculas y sin tildes. El orden define el orden en la página.
   Una sección `generic` solo se usa si la nota no encaja en otra más específica. */
export const SECTIONS = [
  {
    id: "nacionales",
    name: "Nacionales",
    generic: true,
    match: [
      "nacionales", "nacional", "pais", "actualidad politica", "politica", "regional", "comunidad", "coyuntura",
      "elecciones", "congreso", "guanacaste vota", "derechos", "derechos humanos", "equidad y derechos de la mujer",
      "trabajo", "vivienda", "zona norte", "zona sur", "caribe", "nicoya", "nosara", "samara", "santa cruz", "liberia",
    ],
  },
  { id: "sucesos", name: "Sucesos", match: ["sucesos", "codigo extra", "judiciales", "seguridad", "crimen"] },
  {
    id: "educacion",
    name: "Educación",
    match: ["educacion", "universitarias", "noticias una comunica", "noticias vida estudiantil", "formacion"],
  },
  { id: "ambiente", name: "Ambiente", match: ["medio ambiente", "ambiente", "madre tierra", "agua", "ciencia"] },
  { id: "salud", name: "Salud", match: ["salud", "vida y salud", "ejercicio y salud", "alimentacion", "covid-19"] },
  { id: "deportes", name: "Deportes", match: ["deportes", "futbol", "deporte", "recreacion"] },
  { id: "mundo", name: "Mundo", match: ["mundo", "internacional", "internacionales", "solidaridad internacional", "nicaragua"] },
  { id: "economia", name: "Economía", match: ["economia", "extra empresarial", "negocios", "finanzas", "aportes para el desarrollo", "desarrollo"] },
  {
    id: "cultura",
    name: "Cultura y entretenimiento",
    match: [
      "escenario", "entretenimiento", "espectaculos", "cultura", "horoscopo", "farandula", "identidad", "arte",
      "musica", "comida", "estilo de vida", "lucha cultural", "eventos",
    ],
  },
  { id: "opinion", name: "Opinión", match: ["opinion", "columnistas", "editorial", "analisis", "panoramas", "blog"], variant: "opinion" },
];

/* Categorías que no describen el tema de la nota y se ignoran al clasificar */
export const IGNORED_CATEGORIES = [
  "impreso", "ultima hora", "portada", "destacadas", "sin categoria", "sin categorizar", "uncategorized", "noticias",
  "general", "other", "especiales", "video", "visuales", "galeria", "multimedios", "boletines", "una calendario",
  "la voz chequea", "la voz explica", "verdadero",
];

/* Nombres de categoría que se muestran distinto en la etiqueta de la nota */
export const CATEGORY_LABELS = {
  "noticias una comunica": "Educación superior",
  "noticias vida estudiantil": "Vida estudiantil",
};

/* Contenido pagado: estas notas no se muestran */
export const EXCLUDED_CATEGORIES = ["publirreportaje", "contenido patrocinado", "patrocinado"];

export function getSection(id) {
  return SECTIONS.find((section) => section.id === id);
}
