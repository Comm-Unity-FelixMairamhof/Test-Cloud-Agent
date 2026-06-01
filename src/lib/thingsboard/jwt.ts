import type { JwtScope } from "@/types/thingsboard";

export interface JwtPayload {
  sub?: string;
  scopes?: JwtScope | string;
  exp?: number;
  iat?: number;
  userId?: string;
  tenantId?: string;
  customerId?: string;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8");

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenScope(token: string): JwtScope | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.scopes) {
    return null;
  }

  const scope = String(payload.scopes);
  return scope as JwtScope;
}

export function isPreVerificationToken(token: string): boolean {
  return getTokenScope(token) === "PRE_VERIFICATION_TOKEN";
}

export function isRefreshToken(token: string): boolean {
  return getTokenScope(token) === "REFRESH_TOKEN";
}

export function isAccessToken(token: string): boolean {
  const scope = getTokenScope(token);
  if (!scope) {
    return false;
  }

  return !["REFRESH_TOKEN", "PRE_VERIFICATION_TOKEN", "MFA_CONFIGURATION_TOKEN"].includes(
    scope,
  );
}

export function isTokenExpired(token: string, clockSkewSeconds = 30): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds + clockSkewSeconds;
}

export function maskToken(token: string): string {
  if (token.length <= 12) {
    return "***";
  }

  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}
