import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="state-panel state-panel--empty">
      <div className="state-panel__icon" aria-hidden>
        ◌
      </div>
      <h3 className="state-panel__title">{title}</h3>
      {description && <p className="state-panel__text">{description}</p>}
      {action && <div className="state-panel__action">{action}</div>}
    </div>
  );
}
