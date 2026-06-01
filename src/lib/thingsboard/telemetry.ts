import { authorizedJson } from "@/lib/thingsboard/client";
import { parseTelemetryNumber } from "@/lib/utils/format";
import type { DeviceTelemetry, LatestTelemetry, TelemetryPoint } from "@/types/entities";

const TELEMETRY_KEYS = [
  "temperature",
  "targetTemperature",
  "humidity",
  "battery",
  "target_temperature",
  "target_temp",
  "temp",
  "rh",
  "batteryVoltage",
] as const;

const KEY_ALIASES: Record<string, keyof LatestTelemetry> = {
  temperature: "temperature",
  temp: "temperature",
  targetTemperature: "targetTemperature",
  target_temperature: "targetTemperature",
  target_temp: "targetTemperature",
  humidity: "humidity",
  rh: "humidity",
  battery: "battery",
  batteryVoltage: "battery",
};

type TimeseriesResponse = Record<string, TelemetryPoint[]>;

function mapLatestFromTimeseries(data: TimeseriesResponse): LatestTelemetry {
  const result: LatestTelemetry = {};

  for (const [key, points] of Object.entries(data)) {
    const alias = KEY_ALIASES[key];
    if (!alias || !points?.length) continue;
    const value = parseTelemetryNumber(points[0].value);
    if (value !== undefined) {
      result[alias] = value;
    }
  }

  return result;
}

export async function fetchDeviceLatestTelemetry(
  deviceId: string,
): Promise<LatestTelemetry> {
  const keys = TELEMETRY_KEYS.join(",");
  const data = await authorizedJson<TimeseriesResponse>(
    `/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${encodeURIComponent(keys)}`,
  );
  return mapLatestFromTimeseries(data);
}

export async function fetchDeviceTelemetryHistory(
  deviceId: string,
  keys: string[],
  hours = 24,
): Promise<DeviceTelemetry> {
  const endTs = Date.now();
  const startTs = endTs - hours * 60 * 60 * 1000;
  const keyParam = keys.join(",");

  const data = await authorizedJson<TimeseriesResponse>(
    `/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${encodeURIComponent(keyParam)}&startTs=${startTs}&endTs=${endTs}&limit=120&orderBy=ASC`,
  );

  const latest = mapLatestFromTimeseries(data);

  return {
    ...latest,
    temperatureHistory: data.temperature ?? data.temp,
    humidityHistory: data.humidity ?? data.rh,
  };
}

export async function fetchBatchDeviceTelemetry(
  deviceIds: string[],
): Promise<Record<string, LatestTelemetry>> {
  const results: Record<string, LatestTelemetry> = {};

  const batchSize = 8;
  for (let i = 0; i < deviceIds.length; i += batchSize) {
    const batch = deviceIds.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (id) => {
        try {
          results[id] = await fetchDeviceLatestTelemetry(id);
        } catch {
          results[id] = {};
        }
      }),
    );
  }

  return results;
}

export async function saveTargetTemperature(
  deviceId: string,
  targetTemperature: number,
): Promise<void> {
  await authorizedJson<unknown>(`/api/plugins/telemetry/DEVICE/${deviceId}/SERVER_SCOPE`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetTemperature }),
  });
}
