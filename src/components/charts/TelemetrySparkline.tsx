"use client";

import { useId } from "react";
import type { TelemetryPoint } from "@/types/entities";
import { parseTelemetryNumber } from "@/lib/utils/format";

type TelemetrySparklineProps = {
  data?: TelemetryPoint[];
  label: string;
  color?: string;
  height?: number;
};

export function TelemetrySparkline({
  data = [],
  label,
  color = "var(--iw-sage)",
  height = 64,
}: TelemetrySparklineProps) {
  const gradientId = useId().replace(/:/g, "");
  const values = data
    .map((p) => parseTelemetryNumber(p.value))
    .filter((v): v is number => v !== undefined);

  if (values.length < 2) {
    return (
      <div className="sparkline sparkline--empty">
        <p className="sparkline__label">{label}</p>
        <p className="sparkline__empty">Keine Verlaufsdaten (24 h)</p>
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 280;
  const padding = 4;

  const points = values
    .map((v, i) => {
      const x = padding + (i / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const last = values[values.length - 1];

  return (
    <div className="sparkline">
      <div className="sparkline__header">
        <p className="sparkline__label">{label}</p>
        <p className="sparkline__current">{last.toFixed(1)}</p>
      </div>
      <svg
        className="sparkline__svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}: letzter Wert ${last.toFixed(1)}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          className="sparkline__line"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <polygon
          fill={`url(#${gradientId})`}
          points={`${padding},${height} ${points} ${width - padding},${height}`}
        />
      </svg>
    </div>
  );
}
