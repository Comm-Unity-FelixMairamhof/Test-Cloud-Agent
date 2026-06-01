import type { EntityStatus } from "@/types/entities";

const LABELS: Record<EntityStatus, string> = {
  active: "Aktiv",
  offline: "Offline",
  low_battery: "Batterie niedrig",
  override: "Eigene Einstellungen",
  default: "Standardwerte",
};

const VARIANTS: Record<EntityStatus, string> = {
  active: "status-badge--active",
  offline: "status-badge--offline",
  low_battery: "status-badge--warn",
  override: "status-badge--override",
  default: "status-badge--default",
};

type StatusBadgeProps = {
  status: EntityStatus;
  className?: string;
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${VARIANTS[status]} ${className}`.trim()}>
      <span className="status-badge__dot" aria-hidden />
      {LABELS[status]}
    </span>
  );
}
