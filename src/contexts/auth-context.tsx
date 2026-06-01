"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  clearStoredSession,
  getStoredSession,
  saveStoredSession,
} from "@/lib/auth/session";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  notifySessionChange,
  subscribeToSession,
} from "@/lib/auth/session-store";
import {
  completeLogin,
  logoutFromThingsBoard,
  toAuthFailureMessage,
} from "@/lib/thingsboard/auth";
import type {
  AuthSuccess,
  LoginCredentials,
  PendingTwoFaSession,
  ThingsboardUser,
} from "@/types/thingsboard";

interface AuthContextValue {
  user: ThingsboardUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingTwoFa: PendingTwoFaSession | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  verifyTwoFa: (totpCode: string) => Promise<void>;
  cancelTwoFa: () => void;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const [user, setUser] = useState<ThingsboardUser | null>(session?.user ?? null);
  const [pendingTwoFa, setPendingTwoFa] = useState<PendingTwoFaSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(session?.token);
  const activeUser = user ?? session?.user ?? null;

  const handleAuthSuccess = useCallback(
    (auth: AuthSuccess, nextUser: ThingsboardUser | null) => {
      saveStoredSession(auth, nextUser);
      setUser(nextUser);
      setPendingTwoFa(null);
      setError(null);
      notifySessionChange();
    },
    [],
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setError(null);
      setIsLoading(true);

      try {
        const result = await completeLogin(credentials, pendingTwoFa);

        if (result.type === "2fa_required") {
          setPendingTwoFa(result.session);
          return;
        }

        if (result.type === "failure") {
          setError(toAuthFailureMessage(result.failure));
          return;
        }

        handleAuthSuccess(result.auth, result.user);
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess, pendingTwoFa],
  );

  const verifyTwoFa = useCallback(
    async (totpCode: string) => {
      if (!pendingTwoFa) {
        setError("Keine aktive 2FA-Sitzung. Bitte erneut anmelden.");
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const result = await completeLogin({ username: "", password: "", totpCode }, pendingTwoFa);

        if (result.type === "failure") {
          setError(toAuthFailureMessage(result.failure));
          return;
        }

        if (result.type === "success") {
          handleAuthSuccess(result.auth, result.user);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess, pendingTwoFa],
  );

  const cancelTwoFa = useCallback(() => {
    setPendingTwoFa(null);
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    const session = getStoredSession();
    if (session) {
      await logoutFromThingsBoard(session.baseUrl, session.token);
    }

    clearStoredSession();
    setUser(null);
    setPendingTwoFa(null);
    setError(null);
    notifySessionChange();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: activeUser,
      isAuthenticated,
      isLoading,
      pendingTwoFa,
      login,
      verifyTwoFa,
      cancelTwoFa,
      logout,
      error,
      clearError: () => setError(null),
    }),
    [
      activeUser,
      isAuthenticated,
      isLoading,
      pendingTwoFa,
      login,
      verifyTwoFa,
      cancelTwoFa,
      logout,
      error,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden.");
  }

  return context;
}
