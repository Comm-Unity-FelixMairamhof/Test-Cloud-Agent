"use client";

import { useEffect, useState } from "react";
import { TelemetrySparkline } from "@/components/charts/TelemetrySparkline";
import { BatteryIndicator } from "@/components/temperature/BatteryIndicator";
import { HumidityIndicator } from "@/components/temperature/HumidityIndicator";
import { TemperatureControl } from "@/components/temperature/TemperatureControl";
import { TemperatureRing } from "@/components/temperature/TemperatureRing";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  fetchDeviceTelemetryHistory,
  saveTargetTemperature,
} from "@/lib/thingsboard/telemetry";
import type { HierarchyNode } from "@/types/entities";

type DeviceDetailPanelProps = {
  device: HierarchyNode;
  onBack: () => void;
  onSaved: () => void;
};

export function DeviceDetailPanel({ device, onBack, onSaved }: DeviceDetailPanelProps) {
  const initialTarget = device.telemetry?.targetTemperature ?? 20;
  const [target, setTarget] = useState(initialTarget);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof fetchDeviceTelemetryHistory>> | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchDeviceTelemetryHistory(device.id, [
          "temperature",
          "humidity",
          "targetTemperature",
        ]);
        if (!cancelled) {
          setHistory(data);
          if (data.targetTemperature !== undefined) {
            setTarget(data.targetTemperature);
          }
        }
      } catch {
        if (!cancelled) setHistory(null);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [device.id]);

  const telemetry = {
    ...device.telemetry,
    ...history,
  };

  return (
    <section className="detail-panel">
      <button type="button" className="detail-panel__back" onClick={onBack}>
        ← Zurück
      </button>

      <header className="detail-panel__header">
        <div>
          <p className="detail-panel__eyebrow">Heizkörper</p>
          <h2 className="detail-panel__title">{device.name}</h2>
          {device.type && <p className="detail-panel__subtitle">{device.type}</p>}
        </div>
        <StatusBadge status={device.status} />
      </header>

      <div className="detail-panel__hero">
        <TemperatureRing
          current={telemetry.temperature}
          target={telemetry.targetTemperature}
          size="lg"
        />
        <div className="detail-panel__indicators">
          <HumidityIndicator value={telemetry.humidity} />
          <BatteryIndicator value={telemetry.battery} />
        </div>
      </div>

      <TemperatureControl
        value={target}
        onChange={setTarget}
        onSave={async (value) => {
          await saveTargetTemperature(device.id, value);
          onSaved();
        }}
      />

      <div className="detail-panel__charts">
        <h3 className="detail-panel__section-title">Verlauf (24 Stunden)</h3>
        {loadingHistory ? (
          <LoadingState label="Diagramm wird geladen …" />
        ) : (
          <>
            <TelemetrySparkline
              label="Temperatur °C"
              data={history?.temperatureHistory}
              color="var(--iw-amber)"
            />
            <TelemetrySparkline
              label="Luftfeuchtigkeit %"
              data={history?.humidityHistory}
              color="var(--iw-sage)"
            />
          </>
        )}
      </div>
    </section>
  );
}
