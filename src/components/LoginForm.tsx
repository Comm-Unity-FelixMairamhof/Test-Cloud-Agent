"use client";

import {
  checkThingsBoardReachable,
  getThingsBoardUrl,
  loginWithThingsBoard,
} from "@/lib/thingsboard/auth";
import { FormEvent, useEffect, useId, useState } from "react";

type ApiStatus = "checking" | "reachable" | "unreachable";

type LoginFormProps = {
  appName: string;
};

export function LoginForm({ appName }: LoginFormProps) {
  const formId = useId();
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const thingsboardUrl = getThingsBoardUrl();

  useEffect(() => {
    let cancelled = false;

    async function checkApi() {
      const status = await checkThingsBoardReachable();
      if (!cancelled) {
        setApiStatus(status);
      }
    }

    void checkApi();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const data = new FormData(form);
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const result = await loginWithThingsBoard(username, password);

    setIsSubmitting(false);

    if (result.ok) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("tb_token", result.token);
        if (result.refreshToken) {
          sessionStorage.setItem("tb_refresh_token", result.refreshToken);
        }
      }
      setFeedback({
        type: "success",
        text: "Angemeldet — Dashboard folgt in Phase 1.",
      });
      return;
    }

    setFeedback({ type: "error", text: result.error });
  }

  return (
    <section
      className="login-card"
      aria-labelledby={`${formId}-title`}
    >
      <header className="login-card__header">
        <h2 id={`${formId}-title`} className="login-card__title">
          Anmelden
        </h2>
        <p className="login-card__subtitle">
          Mit Ihren Zugangsdaten für {appName}
        </p>
      </header>

      <div
        className={`login-status login-status--${
          apiStatus === "checking"
            ? "checking"
            : apiStatus === "reachable"
              ? "ok"
              : "warn"
        }`}
        data-testid="api-status"
        role="status"
      >
        <span className="login-status__dot" aria-hidden="true" />
        <span>
          {apiStatus === "checking" && "Portal-Verbindung wird geprüft …"}
          {apiStatus === "reachable" &&
            `Portal erreichbar — ${thingsboardUrl.replace(/^https?:\/\//, "")}`}
          {apiStatus === "unreachable" &&
            "Portal von hier nicht erreichbar (z. B. CORS). Formular bleibt nutzbar."}
        </span>
      </div>

      {feedback && (
        <div
          className={`login-status login-status--${
            feedback.type === "error" ? "error" : feedback.type === "success" ? "ok" : "checking"
          }`}
          role="alert"
          style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}
        >
          <span className="login-status__dot" aria-hidden="true" />
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="login-field__toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-label={
                showPassword ? "Passwort verbergen" : "Passwort anzeigen"
              }
            >
              {showPassword ? "Aus" : "An"}
            </button>
          </div>
        </label>

        <button
          type="submit"
          className="login-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird angemeldet …" : "Zum Dashboard"}
        </button>
      </form>

      <p className="login-footer">
        Nachhaltige Gebäudesteuerung von{" "}
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
