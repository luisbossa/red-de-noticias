import { REQUEST_TIMEOUT_MS } from "../config/settings.js";

/* GET de JSON con tiempo límite, respetando la señal de cancelación externa */
export async function getJSON(url, { signal } = {}) {
  const timeout = AbortSignal.timeout?.(REQUEST_TIMEOUT_MS);
  const signals = [signal, timeout].filter(Boolean);
  const combined = signals.length > 1 && AbortSignal.any ? AbortSignal.any(signals) : signals[0];

  const response = await fetch(url, { signal: combined });
  if (!response.ok) throw new Error(`HTTP ${response.status} en ${url}`);
  return response.json();
}
