import { formatTemperature } from "@/lib/utils/format";

type TemperatureRingProps = {
  current?: number;
  target?: number;
  size?: "sm" | "md" | "lg";
};

export function TemperatureRing({ current, target, size = "md" }: TemperatureRingProps) {
  const display = current ?? target;
  const progress =
    display !== undefined ? Math.min(100, Math.max(0, ((display - 10) / 25) * 100)) : 0;

  return (
    <div className={`temp-ring temp-ring--${size}`} role="img" aria-label={`Temperatur ${formatTemperature(display)}`}>
      <svg className="temp-ring__svg" viewBox="0 0 120 120" aria-hidden>
        <circle className="temp-ring__track" cx="60" cy="60" r="52" />
        <circle
          className="temp-ring__progress"
          cx="60"
          cy="60"
          r="52"
          style={{
            strokeDasharray: `${(progress / 100) * 327} 327`,
          }}
        />
      </svg>
      <div className="temp-ring__content">
        <span className="temp-ring__value">{formatTemperature(display, "—")}</span>
        {target !== undefined && current !== undefined && (
          <span className="temp-ring__target">Ziel {formatTemperature(target)}</span>
        )}
      </div>
    </div>
  );
}
