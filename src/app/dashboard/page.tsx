"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/contexts/auth-context";

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col px-4 py-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-emerald-700">Angemeldet</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900">Dashboard</h1>
        {user && (
          <p className="mt-2 text-sm text-zinc-600">
            {user.firstName || user.lastName
              ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
              : user.email}
          </p>
        )}
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Willkommen</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Die ThingsBoard-Authentifizierung ist aktiv. Gebäude, Stockwerke und Räume können
          in den nächsten Schritten hier geladen werden.
        </p>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
      >
        Abmelden
      </button>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
