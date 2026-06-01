export function formatTemperature(value: number | undefined, fallback = "—"): string {
  if (value === undefined || Number.isNaN(value)) {
    return fallback;
  }
  return `${value.toFixed(1)} °C`;
}

export function formatHumidity(value: number | undefined, fallback = "—"): string {
  if (value === undefined || Number.isNaN(value)) {
    return fallback;
  }
  return `${value.toFixed(1)} %`;
}

export function formatBattery(value: number | undefined, fallback = "—"): string {
  if (value === undefined || Number.isNaN(value)) {
    return fallback;
  }
  return `${value.toFixed(1)} V`;
}

export function parseTelemetryNumber(
  raw: string | number | boolean | undefined,
): number | undefined {
  if (raw === undefined || raw === null || raw === "") {
    return undefined;
  }
  const num = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
  return Number.isFinite(num) ? num : undefined;
}

export function getUserDisplayName(
  firstName?: string,
  lastName?: string,
  email?: string,
): string {
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return full || email || "Nutzer";
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}
