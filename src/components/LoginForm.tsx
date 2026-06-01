"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export function LoginForm() {
  const { login, verifyTwoFa, cancelTwoFa, pendingTwoFa, isLoading, error, clearError } =
    useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const showTotpStep = Boolean(pendingTwoFa);

  async function handleCredentialsSubmit(event: FormEvent) {
    event.preventDefault();
    clearError();
    await login({ username: username.trim(), password });
  }

  async function handleTotpSubmit(event: FormEvent) {
    event.preventDefault();
    clearError();

    const code = totpCode.replace(/\s/g, "");
    if (!/^\d{6}$/.test(code)) {
      return;
    }

    await verifyTwoFa(code);
  }

  function handleBackToCredentials() {
    cancelTwoFa();
    setTotpCode("");
    clearError();
  }

  const providerLabel =
    pendingTwoFa?.selectedProvider === "TOTP"
      ? "Authenticator-App"
      : pendingTwoFa?.selectedProvider ?? "2FA";

  if (showTotpStep && pendingTwoFa) {
    return (
      <form onSubmit={handleTotpSubmit} className="flex w-full flex-col gap-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-medium">Zwei-Faktor-Authentifizierung erforderlich</p>
          <p className="mt-1 text-emerald-800">
            Geben Sie den 6-stelligen Code aus Ihrer {providerLabel} ein.
          </p>
        </div>

        <div>
          <label htmlFor="totp" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Verifizierungscode
          </label>
          <input
            id="totp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            value={totpCode}
            onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center text-2xl tracking-[0.4em] text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="000000"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || totpCode.length !== 6}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Wird verifiziert…" : "Code bestätigen"}
        </button>

        <button
          type="button"
          onClick={handleBackToCredentials}
          className="text-sm text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          Zurück zur Anmeldung
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="flex w-full flex-col gap-5">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-zinc-700">
          E-Mail
        </label>
        <input
          id="username"
          type="email"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          placeholder="name@beispiel.at"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-700">
          Passwort
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-3 text-xs font-medium text-zinc-500 hover:text-zinc-800"
            aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
          >
            {showPassword ? "Verbergen" : "Anzeigen"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Wird angemeldet…" : "Anmelden"}
      </button>
    </form>
  );
}
