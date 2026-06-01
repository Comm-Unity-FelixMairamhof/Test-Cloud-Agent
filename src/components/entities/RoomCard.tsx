import { formatHumidity, formatTemperature } from "@/lib/utils/format";
import { collectDevices } from "@/lib/utils/hierarchy";
import type { HierarchyNode } from "@/types/entities";
import { StatusBadge } from "@/components/ui/StatusBadge";

type RoomCardProps = {
  room: HierarchyNode;
  onSelect: () => void;
};

export function RoomCard({ room, onSelect }: RoomCardProps) {
  const devices = collectDevices(room);
  const primary = devices[0];
  const temp = primary?.telemetry?.temperature;
  const target = primary?.telemetry?.targetTemperature;
  const humidity = primary?.telemetry?.humidity;
  const status = primary?.status ?? "offline";
  const hasOverride =
    temp !== undefined &&
    target !== undefined &&
    Math.abs(temp - target) > 0.5;

  return (
    <button type="button" className="entity-card entity-card--room" onClick={onSelect}>
      <div className="entity-card__header">
        <div>
          <p className="entity-card__eyebrow">Raum</p>
          <h3 className="entity-card__title">{room.name}</h3>
        </div>
        <StatusBadge status={hasOverride ? "override" : status} />
      </div>

      <div className="entity-card__temp-row">
        <div className="entity-card__temp-current">
          <span className="entity-card__temp-value">{formatTemperature(temp)}</span>
          <span className="entity-card__temp-label">Aktuell</span>
        </div>
        <div className="entity-card__temp-target">
          <span className="entity-card__temp-value entity-card__temp-value--muted">
            {formatTemperature(target)}
          </span>
          <span className="entity-card__temp-label">Ziel</span>
        </div>
        {humidity !== undefined && (
          <div className="entity-card__humidity">
            <span className="entity-card__humidity-value">{formatHumidity(humidity)}</span>
            <span className="entity-card__temp-label">Luftfeuchtigkeit</span>
          </div>
        )}
      </div>

      {devices.length > 1 && (
        <p className="entity-card__meta">{devices.length} Heizkörper</p>
      )}

      <span className="entity-card__chevron" aria-hidden>
        →
      </span>
    </button>
  );
}
