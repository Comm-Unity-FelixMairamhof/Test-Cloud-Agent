import { formatHumidity } from "@/lib/utils/format";

type HumidityIndicatorProps = {
  value?: number;
};

export function HumidityIndicator({ value }: HumidityIndicatorProps) {
  const level =
    value === undefined ? "unknown" : value < 35 ? "low" : value > 65 ? "high" : "ok";

  return (
    <div className={`indicator indicator--humidity indicator--${level}`}>
      <span className="indicator__icon" aria-hidden>
        💧
      </span>
      <div>
        <span className="indicator__value">{formatHumidity(value)}</span>
        <span className="indicator__label">Luftfeuchtigkeit</span>
      </div>
    </div>
  );
}
