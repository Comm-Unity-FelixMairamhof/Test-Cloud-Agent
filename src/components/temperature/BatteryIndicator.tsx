import { formatBattery } from "@/lib/utils/format";

type BatteryIndicatorProps = {
  value?: number;
};

export function BatteryIndicator({ value }: BatteryIndicatorProps) {
  const level =
    value === undefined ? "unknown" : value < 2.8 ? "low" : value < 3.1 ? "medium" : "ok";

  return (
    <div className={`indicator indicator--battery indicator--${level}`}>
      <span className="indicator__icon" aria-hidden>
        🔋
      </span>
      <div>
        <span className="indicator__value">{formatBattery(value)}</span>
        <span className="indicator__label">Batterie</span>
      </div>
    </div>
  );
}
