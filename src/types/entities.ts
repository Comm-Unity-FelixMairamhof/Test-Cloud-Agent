export type EntityId = {
  id: string;
  entityType: "ASSET" | "DEVICE" | "CUSTOMER" | "TENANT";
};

export type AssetInfo = {
  id: EntityId;
  name: string;
  type: string;
  label?: string;
  customerId?: EntityId;
  additionalInfo?: Record<string, unknown>;
};

export type DeviceInfo = {
  id: EntityId;
  name: string;
  type: string;
  label?: string;
  customerId?: EntityId;
};

export type RelationInfo = {
  from: EntityId;
  to: EntityId;
  type: string;
  typeGroup?: string;
};

export type TelemetryPoint = {
  ts: number;
  value: string | number | boolean;
};

export type LatestTelemetry = {
  temperature?: number;
  targetTemperature?: number;
  humidity?: number;
  battery?: number;
};

export type DeviceTelemetry = LatestTelemetry & {
  temperatureHistory?: TelemetryPoint[];
  humidityHistory?: TelemetryPoint[];
};

export type EntityStatus = "active" | "offline" | "low_battery" | "override" | "default";

export type HierarchyNode = {
  id: string;
  name: string;
  type: string;
  kind: "building" | "floor" | "room" | "device" | "unknown";
  children: HierarchyNode[];
  device?: DeviceInfo;
  asset?: AssetInfo;
  telemetry?: LatestTelemetry;
  status: EntityStatus;
  roomCount?: number;
  deviceCount?: number;
  activeDeviceCount?: number;
};

export type BreadcrumbItem = {
  id: string;
  label: string;
  kind: HierarchyNode["kind"] | "root";
};

export type EntityQueryPageData<T = Record<string, unknown>> = {
  data: Array<{
    entityId: EntityId;
    latest?: Record<string, Array<{ ts: number; value: string }>>;
    timeseries?: Record<string, Array<{ ts: number; value: string }>>;
    latestAttributes?: Record<string, unknown>;
  } & T>;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
};
