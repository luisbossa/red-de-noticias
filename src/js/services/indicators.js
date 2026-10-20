import { EXCHANGE_URL, WEATHER, WEATHER_URL } from "../config/settings.js";
import { getJSON } from "./http.js";

export async function fetchWeather({ signal } = {}) {
  const url = new URL(WEATHER_URL);
  url.search = new URLSearchParams({
    latitude: WEATHER.latitude,
    longitude: WEATHER.longitude,
    current: "temperature_2m,weather_code,is_day",
    daily: "temperature_2m_max,temperature_2m_min",
    timezone: "America/Costa_Rica",
    forecast_days: 1,
  });

  const data = await getJSON(url, { signal });
  return {
    city: WEATHER.city,
    temperature: data.current.temperature_2m,
    code: data.current.weather_code,
    isDay: data.current.is_day === 1,
    max: data.daily.temperature_2m_max[0],
    min: data.daily.temperature_2m_min[0],
  };
}

/* Tipo de cambio oficial del dólar (Ministerio de Hacienda) */
export async function fetchExchangeRate({ signal } = {}) {
  const data = await getJSON(EXCHANGE_URL, { signal });
  return {
    buy: data.compra.valor,
    sell: data.venta.valor,
    date: data.venta.fecha,
  };
}
