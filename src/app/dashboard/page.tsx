"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { DashboardApp } from "@/components/dashboard/DashboardApp";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardApp />
    </AuthGuard>
  );
}
