export const APP_NAME = "Red de Noticias";
export const COMPANY_NAME = "BStudio";
export const LOCALE = "es-CR";

/* Indicadores */
export const WEATHER = { city: "San José", latitude: 9.93, longitude: -84.08 };
export const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
export const EXCHANGE_URL = "https://api.hacienda.go.cr/indicadores/tc/dolar";

/* Noticias que se piden a cada fuente */
export const PER_SOURCE = 30;

/* Cuántas noticias van en la columna lateral de la portada */
export const LATEST_COUNT = 6;

/* Tarjetas que se agregan con cada "Cargar más" */
export const PAGE_SIZE = 8;

/* Notas relacionadas que se muestran en la vista de una noticia */
export const RELATED_COUNT = 4;

/* Tiempo máximo de espera por pedido, caché en memoria y revisión de noticias nuevas */
export const REQUEST_TIMEOUT_MS = 12000;
export const CACHE_TTL_MS = 5 * 60 * 1000;
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
