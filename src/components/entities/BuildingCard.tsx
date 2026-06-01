import { formatTemperature } from "@/lib/utils/format";
import type { HierarchyNode } from "@/types/entities";
import { StatusBadge } from "@/components/ui/StatusBadge";

type BuildingCardProps = {
  building: HierarchyNode;
  avgTemp?: number;
  onSelect: () => void;
};

export function BuildingCard({ building, avgTemp, onSelect }: BuildingCardProps) {
  const rooms = building.roomCount ?? 0;
  const devices = building.deviceCount ?? 0;
  const active = building.activeDeviceCount ?? 0;

  return (
    <button type="button" className="entity-card entity-card--building" onClick={onSelect}>
      <div className="entity-card__header">
        <div>
          <p className="entity-card__eyebrow">Gebäude</p>
          <h3 className="entity-card__title">{building.name}</h3>
        </div>
        <StatusBadge status={active > 0 ? "active" : "offline"} />
      </div>

      <div className="entity-card__metrics">
        <div className="entity-card__metric">
          <span className="entity-card__metric-value">
            {avgTemp !== undefined ? formatTemperature(avgTemp) : "—"}
          </span>
          <span className="entity-card__metric-label">Ø Temperatur</span>
        </div>
        <div className="entity-card__metric">
          <span className="entity-card__metric-value">{rooms}</span>
          <span className="entity-card__metric-label">Räume</span>
        </div>
        <div className="entity-card__metric">
          <span className="entity-card__metric-value">
            {active}/{devices}
          </span>
          <span className="entity-card__metric-label">Heizkörper aktiv</span>
        </div>
      </div>

      <span className="entity-card__chevron" aria-hidden>
        →
      </span>
    </button>
  );
}
