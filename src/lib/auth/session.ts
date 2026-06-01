import type { AuthContext, StoredSession, ThingsboardUser } from "@/types/thingsboard";

const SESSION_STORAGE_KEY = "iot-wizard.tb.session";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveStoredSession(
  auth: AuthContext,
  user?: ThingsboardUser | null,
): StoredSession {
  const session: StoredSession = {
    ...auth,
    user: user ?? undefined,
  };

  if (isBrowser()) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

export function getStoredSession(): StoredSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function updateStoredTokens(
  token: string,
  refreshToken: string,
): StoredSession | null {
  const session = getStoredSession();
  if (!session) {
    return null;
  }

  const updated: StoredSession = {
    ...session,
    token,
    refreshToken,
    authHeader: `Bearer ${token}`,
    issuedAtIso: new Date().toISOString(),
  };

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function updateStoredUser(user: ThingsboardUser): StoredSession | null {
  const session = getStoredSession();
  if (!session) {
    return null;
  }

  const updated: StoredSession = { ...session, user };
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearStoredSession(): void {
  if (isBrowser()) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export function hasStoredSession(): boolean {
  return getStoredSession() !== null;
}
