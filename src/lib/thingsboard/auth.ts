import {
  assertHttps,
  getThingsBoardUrl,
  sanitizeBaseUrl,
  TOKEN_EXPIRES_HINT,
} from "@/lib/thingsboard/config";
import { isPreVerificationToken } from "@/lib/thingsboard/jwt";
import type {
  AuthContext,
  AuthFailure,
  AuthResult,
  AuthSuccess,
  JwtPair,
  LoginCredentials,
  PendingTwoFaSession,
  ThingsboardErrorResponse,
  ThingsboardUser,
  TwoFaProviderInfo,
  TwoFaProviderType,
} from "@/types/thingsboard";

const AUTH_HEADER_PREFIX = "Bearer ";

function buildAuthHeader(token: string): string {
  return `${AUTH_HEADER_PREFIX}${token}`;
}

function buildAuthContext(baseUrl: string, token: string, refreshToken: string): AuthContext {
  return {
    baseUrl,
    token,
    refreshToken,
    authHeader: buildAuthHeader(token),
    issuedAtIso: new Date().toISOString(),
    expiresHint: TOKEN_EXPIRES_HINT,
  };
}

function authFailure(
  stage: AuthFailure["stage"],
  status: number,
  reason: string,
): AuthFailure {
  return { ok: false, stage, status, reason };
}

async function parseErrorResponse(response: Response): Promise<ThingsboardErrorResponse | null> {
  try {
    return (await response.json()) as ThingsboardErrorResponse;
  } catch {
    return null;
  }
}

function mapLoginError(error: ThingsboardErrorResponse | null, status: number): string {
  if (!error?.message) {
    return status === 401
      ? "Anmeldung fehlgeschlagen. Bitte Benutzername und Passwort prüfen."
      : `Anmeldung fehlgeschlagen (HTTP ${status}).`;
  }

  if (error.errorCode === 15 || error.resetToken) {
    return "Ihr Passwort ist abgelaufen. Bitte setzen Sie es in ThingsBoard zurück.";
  }

  if (error.message.toLowerCase().includes("locked")) {
    return "Ihr Konto ist gesperrt. Bitte wenden Sie sich an den Administrator.";
  }

  if (error.message.toLowerCase().includes("not active")) {
    return "Ihr Konto ist nicht aktiv. Bitte aktivieren Sie es zuerst.";
  }

  return error.message;
}

function map2faError(error: ThingsboardErrorResponse | null, status: number): string {
  if (status === 429) {
    return "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
  }

  if (status === 401) {
    return "Ungültiger Verifizierungscode. Bitte geben Sie einen aktuellen 6-stelligen Code ein.";
  }

  return (
    error?.message ??
    "Zwei-Faktor-Verifizierung fehlgeschlagen. Bitte erneut versuchen."
  );
}

export async function tbFetch(
  baseUrl: string,
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("X-Authorization", buildAuthHeader(token));
  }

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
}

export async function validateToken(baseUrl: string, token: string): Promise<boolean> {
  const response = await tbFetch(baseUrl, "/api/auth/user", { method: "GET" }, token);
  return response.ok;
}

export async function fetchCurrentUser(
  baseUrl: string,
  token: string,
): Promise<ThingsboardUser | null> {
  const response = await tbFetch(baseUrl, "/api/auth/user", { method: "GET" }, token);
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as ThingsboardUser;
}

export async function getTwoFaProviders(
  baseUrl: string,
  preVerificationToken: string,
): Promise<TwoFaProviderInfo[]> {
  const response = await tbFetch(
    baseUrl,
    "/api/auth/2fa/providers",
    { method: "GET" },
    preVerificationToken,
  );

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as TwoFaProviderInfo[];
}

function selectTotpProvider(providers: TwoFaProviderInfo[]): TwoFaProviderType {
  const totp = providers.find((provider) => provider.type === "TOTP");
  if (totp) {
    return "TOTP";
  }

  const defaultProvider = providers.find(
    (provider) => provider.default === true || provider.isDefault === true,
  );
  if (defaultProvider) {
    return defaultProvider.type;
  }

  return providers[0]?.type ?? "TOTP";
}

export async function loginWithCredentials(
  credentials: LoginCredentials,
  baseUrlInput?: string,
): Promise<
  | { type: "success"; auth: AuthSuccess; user: ThingsboardUser | null }
  | { type: "2fa_required"; session: PendingTwoFaSession }
  | { type: "failure"; failure: AuthFailure }
> {
  const baseUrl = sanitizeBaseUrl(baseUrlInput ?? getThingsBoardUrl());
  const httpsError = assertHttps(baseUrl, credentials.allowHttpForLocalDev);
  if (httpsError) {
    return {
      type: "failure",
      failure: authFailure("login", 0, httpsError),
    };
  }

  const loginResponse = await tbFetch(baseUrl, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  if (!loginResponse.ok) {
    const error = await parseErrorResponse(loginResponse);
    return {
      type: "failure",
      failure: authFailure(
        "login",
        loginResponse.status,
        mapLoginError(error, loginResponse.status),
      ),
    };
  }

  const loginData = (await loginResponse.json()) as JwtPair;

  if (isPreVerificationToken(loginData.token)) {
    const providers = await getTwoFaProviders(baseUrl, loginData.token);
    const selectedProvider = selectTotpProvider(providers);

    return {
      type: "2fa_required",
      session: {
        baseUrl,
        preVerificationToken: loginData.token,
        refreshToken: loginData.refreshToken,
        providers,
        selectedProvider,
      },
    };
  }

  const isValid = await validateToken(baseUrl, loginData.token);
  if (!isValid) {
    return {
      type: "failure",
      failure: authFailure(
        "login",
        401,
        "Anmeldung erfolgreich, aber Token konnte nicht validiert werden.",
      ),
    };
  }

  const user = await fetchCurrentUser(baseUrl, loginData.token);
  const authContext = buildAuthContext(baseUrl, loginData.token, loginData.refreshToken);

  return {
    type: "success",
    auth: { ok: true, ...authContext },
    user,
  };
}

export async function verifyTwoFaCode(
  session: PendingTwoFaSession,
  verificationCode: string,
  providerType?: TwoFaProviderType,
): Promise<
  | { type: "success"; auth: AuthSuccess; user: ThingsboardUser | null }
  | { type: "failure"; failure: AuthFailure }
> {
  const provider = providerType ?? session.selectedProvider;
  const params = new URLSearchParams({
    providerType: provider,
    verificationCode: verificationCode.trim(),
  });

  const verifyResponse = await tbFetch(
    session.baseUrl,
    `/api/auth/2fa/verification/check?${params.toString()}`,
    { method: "POST" },
    session.preVerificationToken,
  );

  if (!verifyResponse.ok) {
    const error = await parseErrorResponse(verifyResponse);
    return {
      type: "failure",
      failure: authFailure(
        "2fa_verify",
        verifyResponse.status,
        map2faError(error, verifyResponse.status),
      ),
    };
  }

  let tokenPair = (await verifyResponse.json()) as JwtPair;

  if (!tokenPair.token || isPreVerificationToken(tokenPair.token)) {
    const loginResponse = await tbFetch(
      session.baseUrl,
      "/api/auth/2fa/login",
      { method: "POST" },
      session.preVerificationToken,
    );

    if (!loginResponse.ok) {
      const error = await parseErrorResponse(loginResponse);
      return {
        type: "failure",
        failure: authFailure(
          "2fa_login",
          loginResponse.status,
          error?.message ?? "Token-Austausch nach 2FA fehlgeschlagen.",
        ),
      };
    }

    tokenPair = (await loginResponse.json()) as JwtPair;
  }

  const isValid = await validateToken(session.baseUrl, tokenPair.token);
  if (!isValid) {
    return {
      type: "failure",
      failure: authFailure(
        "2fa_login",
        401,
        "2FA erfolgreich, aber Access-Token konnte nicht validiert werden.",
      ),
    };
  }

  const user = await fetchCurrentUser(session.baseUrl, tokenPair.token);
  const authContext = buildAuthContext(
    session.baseUrl,
    tokenPair.token,
    tokenPair.refreshToken,
  );

  return {
    type: "success",
    auth: { ok: true, ...authContext },
    user,
  };
}

export async function refreshAccessToken(
  baseUrl: string,
  refreshToken: string,
): Promise<AuthResult> {
  const response = await tbFetch(baseUrl, "/api/auth/token", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    return authFailure(
      "refresh",
      response.status,
      error?.message ??
        "Token-Aktualisierung fehlgeschlagen. Bitte erneut anmelden.",
    );
  }

  const tokenPair = (await response.json()) as JwtPair;
  const isValid = await validateToken(baseUrl, tokenPair.token);
  if (!isValid) {
    return authFailure(
      "refresh",
      401,
      "Neuer Token konnte nicht validiert werden. Bitte erneut anmelden.",
    );
  }

  return { ok: true, ...buildAuthContext(baseUrl, tokenPair.token, tokenPair.refreshToken) };
}

export async function logoutFromThingsBoard(
  baseUrl: string,
  token: string,
): Promise<void> {
  try {
    await tbFetch(baseUrl, "/api/auth/logout", { method: "POST" }, token);
  } catch {
    // Lokale Session wird unabhängig davon gelöscht.
  }
}

export async function completeLogin(
  credentials: LoginCredentials,
  pendingSession?: PendingTwoFaSession | null,
): Promise<
  | { type: "success"; auth: AuthSuccess; user: ThingsboardUser | null }
  | { type: "2fa_required"; session: PendingTwoFaSession }
  | { type: "failure"; failure: AuthFailure }
> {
  if (pendingSession && credentials.totpCode) {
    const result = await verifyTwoFaCode(
      pendingSession,
      credentials.totpCode,
      pendingSession.selectedProvider,
    );

    if (result.type === "failure") {
      return result;
    }

    return result;
  }

  return loginWithCredentials(credentials);
}

export function toAuthFailureMessage(failure: AuthFailure): string {
  if (failure.stage === "2fa_verify") {
    return `${failure.reason} Mögliche Ursachen: falscher Code, Zeitabweichung des Geräts oder abgelaufene Verifizierungssitzung.`;
  }

  return failure.reason;
}
