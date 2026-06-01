"use client";

import { useAuth } from "@/contexts/auth-context";
import { FormEvent, useId, useState } from "react";

type LoginFormProps = {
  appName: string;
};

export function LoginForm({ appName }: LoginFormProps) {
  const formId = useId();
  const {
    login,
    verifyTwoFa,
    cancelTwoFa,
    pendingTwoFa,
    isLoading,
    error,
    clearError,
  } = useAuth();

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
      : (pendingTwoFa?.selectedProvider ?? "2FA");

  if (showTotpStep && pendingTwoFa) {
    return (
      <section
        className="login-card"
        aria-labelledby={`${formId}-totp-title`}
      >
        <header className="login-card__header">
          <h2 id={`${formId}-totp-title`} className="login-card__title">
            Zwei-Faktor-Authentifizierung
          </h2>
          <p className="login-card__subtitle">
            6-stelligen Code aus Ihrer {providerLabel} eingeben
          </p>
        </header>

        {error && (
          <div
            className="login-status login-status--error"
            role="alert"
            style={{ marginBottom: "1rem" }}
          >
            <span className="login-status__dot" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleTotpSubmit} noValidate>
          <label className="login-field" htmlFor={`${formId}-totp`}>
            <span className="login-field__label">Verifizierungscode</span>
            <input
              id={`${formId}-totp`}
              className="login-field__input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              value={totpCode}
              onChange={(event) =>
                setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={isLoading}
              placeholder="000000"
              style={{ textAlign: "center", letterSpacing: "0.35em" }}
            />
          </label>

          <button
            type="submit"
            className="login-submit"
            disabled={isLoading || totpCode.length !== 6}
          >
            {isLoading ? "Wird verifiziert …" : "Code bestätigen"}
          </button>

          <button
            type="button"
            className="login-field__toggle"
            onClick={handleBackToCredentials}
            style={{
              display: "block",
              width: "100%",
              marginTop: "1rem",
              textAlign: "center",
            }}
          >
            Zurück zur Anmeldung
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="login-card" aria-labelledby={`${formId}-title`}>
      <header className="login-card__header">
        <h2 id={`${formId}-title`} className="login-card__title">
          Anmelden
        </h2>
        <p className="login-card__subtitle">
          Mit Ihren Zugangsdaten für {appName}
        </p>
      </header>

      {error && (
        <div
          className="login-status login-status--error"
          role="alert"
          style={{ marginBottom: "1rem" }}
        >
          <span className="login-status__dot" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCredentialsSubmit} noValidate>
        <label className="login-field" htmlFor={`${formId}-email`}>
          <span className="login-field__label">E-Mail</span>
          <input
            id={`${formId}-email`}
            className="login-field__input"
            type="email"
            name="username"
            autoComplete="username"
            inputMode="email"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isLoading}
            placeholder="name@beispiel.at"
          />
        </label>

        <label className="login-field" htmlFor={`${formId}-password`}>
          <span className="login-field__label">Passwort</span>
          <div className="login-field__control">
            <input
              id={`${formId}-password`}
              className="login-field__input login-field__input--with-toggle"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              className="login-field__toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-pressed={showPassword}
              aria-label={
                showPassword ? "Passwort verbergen" : "Passwort anzeigen"
              }
            >
              {showPassword ? "Aus" : "An"}
            </button>
          </div>
        </label>

        <button type="submit" className="login-submit" disabled={isLoading}>
          {isLoading ? "Wird angemeldet …" : "Zum Dashboard"}
        </button>
      </form>

      <p className="login-footer">
        Sichere Anmeldung über ThingsBoard. Nachhaltige Gebäudesteuerung von{" "}
        <a
          href="https://iot-wizard.at"
          target="_blank"
          rel="noopener noreferrer"
        >
          IoT-Wizard
        </a>
      </p>
    </section>
  );
}
