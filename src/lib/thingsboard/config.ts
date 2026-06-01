const DEFAULT_BASE_URL = "https://kundenportal.iot-wizard.at";

export function getThingsBoardUrl(): string {
  const url = process.env.NEXT_PUBLIC_THINGSBOARD_URL ?? DEFAULT_BASE_URL;
  return sanitizeBaseUrl(url);
}

export function sanitizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

export function assertHttps(
  baseUrl: string,
  allowHttpForLocalDev = false,
): string | null {
  if (baseUrl.startsWith("https://")) {
    return null;
  }

  const isLocalDev =
    allowHttpForLocalDev &&
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(baseUrl);

  if (isLocalDev) {
    return null;
  }

  return "HTTPS ist für Produktions-Instanzen erforderlich. Für lokale Entwicklung allowHttpForLocalDev=true setzen.";
}

export const TOKEN_EXPIRES_HINT =
  "Standard-Lebensdauer des Access-Tokens beträgt üblicherweise 2,5 Stunden, sofern in ThingsBoard nicht anders konfiguriert.";
