import { formatTemperature } from "@/lib/utils/format";
import type { HierarchyNode } from "@/types/entities";
import { BatteryIndicator } from "@/components/temperature/BatteryIndicator";
import { HumidityIndicator } from "@/components/temperature/HumidityIndicator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TemperatureRing } from "@/components/temperature/TemperatureRing";

type DeviceCardProps = {
  device: HierarchyNode;
  onSelect: () => void;
  compact?: boolean;
};

export function DeviceCard({ device, onSelect, compact = false }: DeviceCardProps) {
  const { temperature, targetTemperature, humidity, battery } = device.telemetry ?? {};

  if (compact) {
    return (
      <button type="button" className="entity-card entity-card--device-compact" onClick={onSelect}>
        <span className="entity-card__title">{device.name}</span>
        <span className="entity-card__temp-value">{formatTemperature(temperature)}</span>
      </button>
    );
  }

  return (
    <button type="button" className="entity-card entity-card--device" onClick={onSelect}>
      <div className="entity-card__header">
        <div>
          <p className="entity-card__eyebrow">Heizkörper</p>
          <h3 className="entity-card__title">{device.name}</h3>
          {device.type && <p className="entity-card__type">{device.type}</p>}
        </div>
        <StatusBadge status={device.status} />
      </div>

      <div className="entity-card__device-body">
        <TemperatureRing
          current={temperature}
          target={targetTemperature}
          size="md"
        />
        <div className="entity-card__indicators">
          <HumidityIndicator value={humidity} />
          <BatteryIndicator value={battery} />
        </div>
      </div>

      <span className="entity-card__chevron" aria-hidden>
        →
      </span>
    </button>
  );
}
