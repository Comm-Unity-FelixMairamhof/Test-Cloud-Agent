"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { TemperatureOrnament } from "@/components/login/TemperatureOrnament";
import { useAuth } from "@/contexts/auth-context";

const appName =
  process.env.NEXT_PUBLIC_APP_NAME ?? "Temperatursteuerung";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, pendingTwoFa } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !pendingTwoFa) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pendingTwoFa, router]);

  return (
    <div className="login-scene">
      <div className="login-scene__ambient" aria-hidden="true">
        <div className="login-scene__mesh" />
        <div className="login-scene__grain" />
      </div>

      <aside className="login-scene__brand">
        <div className="login-brand__ornament-wrap">
          <TemperatureOrnament />
        </div>
        <p className="login-brand__eyebrow">IoT-Wizard</p>
        <h1 className="login-brand__title">
          Wärme mit
          <br />
          Weitblick.
        </h1>
        <p className="login-brand__lead">
          Steuern Sie Gebäude, Stockwerke, Räume und Heizkörper — klar,
          mobil und im Einklang mit Ihrer Nachhaltigkeitsstrategie.
        </p>
      </aside>

      <main className="login-scene__panel" id="main-content">
        <LoginForm appName={appName} />
      </main>
    </div>
  );
}
