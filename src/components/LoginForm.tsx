"use client";

import { FormEvent, useEffect, useState } from "react";

const thingsboardUrl =
  process.env.NEXT_PUBLIC_THINGSBOARD_URL ??
  "https://kundenportal.iot-wizard.at";

type ApiStatus = "checking" | "reachable" | "unreachable";

export function LoginForm() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkApi() {
      try {
        const response = await fetch(`${thingsboardUrl}/api/auth/user`, {
          method: "GET",
          credentials: "omit",
        });
        if (!cancelled) {
          // 401/403 means the API is up; network errors mean unreachable.
          setApiStatus(response.status === 401 || response.status === 403 ? "reachable" : response.ok ? "reachable" : "unreachable");
        }
      } catch {
        if (!cancelled) {
          setApiStatus("unreachable");
        }
      }
    }

    void checkApi();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Login mit ThingsBoard ist in Phase 1 geplant — die Entwicklungsumgebung ist bereit.",
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-emerald-800/60 bg-emerald-900/40 p-6 shadow-lg space-y-4"
    >
      <div
        className="rounded-lg px-3 py-2 text-sm border"
        data-testid="api-status"
        role="status"
      >
        {apiStatus === "checking" && (
          <span className="text-emerald-200">ThingsBoard API wird geprüft…</span>
        )}
        {apiStatus === "reachable" && (
          <span className="text-emerald-300 border-emerald-700">
            ThingsBoard erreichbar ({thingsboardUrl})
          </span>
        )}
        {apiStatus === "unreachable" && (
          <span className="text-amber-300 border-amber-800">
            ThingsBoard nicht erreichbar — lokale UI funktioniert trotzdem
          </span>
        )}
      </div>

      <label className="block space-y-1">
        <span className="text-sm text-emerald-200">E-Mail</span>
        <input
          type="email"
          name="username"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-emerald-700 bg-emerald-950 px-3 py-2 text-emerald-50 placeholder:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="name@beispiel.at"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-emerald-200">Passwort</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-emerald-700 bg-emerald-950 px-3 py-2 text-emerald-50 placeholder:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </label>

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold py-2.5 transition-colors"
      >
        Anmelden
      </button>

      {message && (
        <p className="text-sm text-center text-emerald-200" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
