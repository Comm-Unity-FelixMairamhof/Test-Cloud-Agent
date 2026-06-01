"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, pendingTwoFa } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !pendingTwoFa) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pendingTwoFa, router]);

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-lg shadow-emerald-600/30">
            IW
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">IoT-Wizard</h1>
          <p className="mt-2 text-sm text-zinc-600">Temperatursteuerung – Anmeldung</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Sichere Anmeldung über ThingsBoard. Ihre Zugangsdaten werden nicht gespeichert.
        </p>
      </div>
    </main>
  );
}
