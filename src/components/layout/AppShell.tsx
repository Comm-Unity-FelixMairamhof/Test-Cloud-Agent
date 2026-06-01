import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
};

export function AppShell({ children, header, footer }: AppShellProps) {
  return (
    <div className="app-scene">
      <div className="app-scene__ambient" aria-hidden>
        <div className="app-scene__mesh" />
        <div className="app-scene__grain" />
      </div>
      <div className="app-scene__content">
        {header}
        <main className="app-main">{children}</main>
        {footer}
      </div>
    </div>
  );
}
