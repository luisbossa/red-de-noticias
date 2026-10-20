/* Medios de noticias. `type` indica qué adaptador de services/ los lee.
   Para agregar otro medio con WordPress basta con sumar una entrada aquí
   (debe permitir CORS en /wp-json/wp/v2/posts). */
export const SOURCES = [
  {
    id: "extra",
    name: "Diario Extra",
    type: "wordpress",
    baseUrl: "https://www.diarioextra.com",
  },
  {
    id: "universidad",
    name: "Semanario Universidad",
    type: "wordpress",
    baseUrl: "https://semanariouniversidad.com",
  },
  {
    id: "voz",
    name: "Voz de Guanacaste",
    type: "wordpress",
    baseUrl: "https://www.vozdeguanacaste.com",
  },
  {
    id: "surcos",
    name: "Surcos Digital",
    type: "wordpress",
    baseUrl: "https://www.surcosdigital.com",
  },
  {
    id: "una",
    name: "UNA Comunica",
    type: "wordpress",
    baseUrl: "https://www.una.ac.cr",
  },
];

export function getSource(id) {
  return SOURCES.find((source) => source.id === id);
}
