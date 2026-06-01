const thingsboardUrl =
  process.env.NEXT_PUBLIC_THINGSBOARD_URL ??
  "https://kundenportal.iot-wizard.at";

export type ThingsBoardLoginResponse = {
  token: string;
  refreshToken?: string;
};

export type LoginResult =
  | { ok: true; token: string; refreshToken?: string }
  | { ok: false; error: string };

export function getThingsBoardUrl(): string {
  return thingsboardUrl;
}

export async function loginWithThingsBoard(
  username: string,
  password: string,
): Promise<LoginResult> {
  try {
    const response = await fetch(`${thingsboardUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          ok: false,
          error: "E-Mail oder Passwort ist ungültig.",
        };
      }
      return {
        ok: false,
        error: `Anmeldung fehlgeschlagen (${response.status}).`,
      };
    }

    const data = (await response.json()) as ThingsBoardLoginResponse;
    if (!data.token) {
      return { ok: false, error: "Unerwartete Antwort vom Server." };
    }

    return {
      ok: true,
      token: data.token,
      refreshToken: data.refreshToken,
    };
  } catch {
    return {
      ok: false,
      error:
        "Verbindung zum Portal nicht möglich. Bitte Netzwerk prüfen oder später erneut versuchen.",
    };
  }
}

export async function checkThingsBoardReachable(): Promise<
  "checking" | "reachable" | "unreachable"
> {
  try {
    const response = await fetch(`${thingsboardUrl}/api/auth/user`, {
      method: "GET",
      credentials: "omit",
    });
    if (response.status === 401 || response.status === 403 || response.ok) {
      return "reachable";
    }
    return "unreachable";
  } catch {
    return "unreachable";
  }
}
