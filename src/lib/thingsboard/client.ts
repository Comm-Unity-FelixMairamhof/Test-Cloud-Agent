import { refreshAccessToken, tbFetch } from "@/lib/thingsboard/auth";
import { isTokenExpired } from "@/lib/thingsboard/jwt";
import {
  clearStoredSession,
  getStoredSession,
  updateStoredTokens,
} from "@/lib/auth/session";
import type { AuthContext, StoredSession } from "@/types/thingsboard";

export class ThingsBoardApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public requiresReauth = false,
  ) {
    super(message);
    this.name = "ThingsBoardApiError";
  }
}

let refreshPromise: Promise<StoredSession | null> | null = null;

async function refreshSessionIfNeeded(session: StoredSession): Promise<StoredSession> {
  if (!isTokenExpired(session.token)) {
    return session;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const result = await refreshAccessToken(session.baseUrl, session.refreshToken);
      if (!result.ok) {
        clearStoredSession();
        return null;
      }

      return updateStoredTokens(result.token, result.refreshToken);
    })().finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;
  if (!refreshed) {
    throw new ThingsBoardApiError(
      "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
      401,
      true,
    );
  }

  return refreshed;
}

export async function getAuthorizedSession(): Promise<StoredSession | null> {
  const session = getStoredSession();
  if (!session) {
    return null;
  }

  try {
    return await refreshSessionIfNeeded(session);
  } catch {
    return null;
  }
}

export async function authorizedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const session = await getAuthorizedSession();
  if (!session) {
    throw new ThingsBoardApiError(
      "Nicht angemeldet. Bitte melden Sie sich an.",
      401,
      true,
    );
  }

  let response = await tbFetch(session.baseUrl, path, options, session.token);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken(session.baseUrl, session.refreshToken);
    if (!refreshed.ok) {
      clearStoredSession();
      throw new ThingsBoardApiError(refreshed.reason, refreshed.status, true);
    }

    updateStoredTokens(refreshed.token, refreshed.refreshToken);
    response = await tbFetch(session.baseUrl, path, options, refreshed.token);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ThingsBoardApiError(
      "Zugriff verweigert oder Sitzung abgelaufen.",
      response.status,
      true,
    );
  }

  return response;
}

export async function authorizedJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await authorizedFetch(path, options);
  if (!response.ok) {
    throw new ThingsBoardApiError(
      `API-Anfrage fehlgeschlagen (HTTP ${response.status}).`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function getAuthContextFromSession(session: StoredSession): AuthContext {
  return {
    baseUrl: session.baseUrl,
    token: session.token,
    refreshToken: session.refreshToken,
    authHeader: session.authHeader,
    issuedAtIso: session.issuedAtIso,
    expiresHint: session.expiresHint,
  };
}
