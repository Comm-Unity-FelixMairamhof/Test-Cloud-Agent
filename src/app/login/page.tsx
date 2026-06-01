import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center space-y-2">
          <p className="text-emerald-300 text-sm font-medium tracking-wide uppercase">
            IoT-Wizard
          </p>
          <h1 className="text-2xl font-semibold">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "Temperatursteuerung"}
          </h1>
          <p className="text-emerald-200/80 text-sm">
            Gebäude, Stockwerke, Räume und Heizkörper steuern
          </p>
        </header>
        <LoginForm />
      </div>
    </div>
  );
}
