"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="login-scene">
      <div className="login-scene__ambient" aria-hidden="true">
        <div className="login-scene__mesh" />
      </div>
      <main className="login-scene__panel">
        <p className="login-card__subtitle">Wird weitergeleitet …</p>
      </main>
    </div>
  );
}
