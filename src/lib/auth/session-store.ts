import type { StoredSession } from "@/types/thingsboard";

const SESSION_STORAGE_KEY = "iot-wizard.tb.session";

type SessionListener = () => void;

const listeners = new Set<SessionListener>();

/** Cached snapshot so useSyncExternalStore receives a stable reference. */
let cachedRaw: string | null | undefined = undefined;
let cachedSnapshot: StoredSession | null = null;

function emitSessionChange(): void {
  listeners.forEach((listener) => listener());
}

export function invalidateSessionCache(): void {
  cachedRaw = undefined;
}

export function subscribeToSession(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySessionChange(): void {
  invalidateSessionCache();
  emitSessionChange();
}

export function getSessionSnapshot(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;

  if (!raw) {
    cachedSnapshot = null;
    return null;
  }

  try {
    cachedSnapshot = JSON.parse(raw) as StoredSession;
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    cachedRaw = null;
    cachedSnapshot = null;
  }

  return cachedSnapshot;
}

export function getServerSessionSnapshot(): StoredSession | null {
  return null;
}
