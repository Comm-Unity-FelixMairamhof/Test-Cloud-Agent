import type { StoredSession } from "@/types/thingsboard";
import { getStoredSession } from "@/lib/auth/session";

type SessionListener = () => void;

const listeners = new Set<SessionListener>();

function emitSessionChange(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeToSession(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySessionChange(): void {
  emitSessionChange();
}

export function getSessionSnapshot(): StoredSession | null {
  return getStoredSession();
}

export function getServerSessionSnapshot(): StoredSession | null {
  return null;
}
