import type {
  AssetInfo,
  DeviceInfo,
  HierarchyNode,
  LatestTelemetry,
  RelationInfo,
} from "@/types/entities";

const BUILDING_TYPES = new Set([
  "building",
  "gebäude",
  "gebaeude",
  "site",
  "standort",
]);

const FLOOR_TYPES = new Set([
  "floor",
  "stockwerk",
  "etage",
  "level",
  "geschoss",
]);

const ROOM_TYPES = new Set([
  "room",
  "raum",
  "zone",
  "bereich",
]);

export function classifyAssetType(type: string): HierarchyNode["kind"] {
  const normalized = type.trim().toLowerCase();
  if (BUILDING_TYPES.has(normalized)) return "building";
  if (FLOOR_TYPES.has(normalized)) return "floor";
  if (ROOM_TYPES.has(normalized)) return "room";
  return "unknown";
}

export function classifyKind(
  entityType: string,
  assetType?: string,
): HierarchyNode["kind"] {
  if (entityType === "DEVICE") return "device";
  if (assetType) {
    const kind = classifyAssetType(assetType);
    if (kind !== "unknown") return kind;
  }
  return "unknown";
}

export function buildHierarchyTree(
  assets: AssetInfo[],
  devices: DeviceInfo[],
  relations: RelationInfo[],
  telemetryByDeviceId: Record<string, LatestTelemetry>,
): HierarchyNode[] {
  const assetNodes = new Map<string, HierarchyNode>();
  const deviceNodes = new Map<string, HierarchyNode>();

  for (const asset of assets) {
    const kind = classifyAssetType(asset.type);
    assetNodes.set(asset.id.id, {
      id: asset.id.id,
      name: asset.name || asset.label || "Unbenannt",
      type: asset.type,
      kind,
      children: [],
      asset,
      status: "active",
    });
  }

  for (const device of devices) {
    const telemetry = telemetryByDeviceId[device.id.id];
    deviceNodes.set(device.id.id, {
      id: device.id.id,
      name: device.name || device.label || "Heizkörper",
      type: device.type,
      kind: "device",
      children: [],
      device,
      telemetry,
      status: inferDeviceStatus(telemetry),
    });
  }

  const childIds = new Set<string>();

  for (const relation of relations) {
    const parent =
      assetNodes.get(relation.from.id) ?? deviceNodes.get(relation.from.id);
    const childAsset = assetNodes.get(relation.to.id);
    const childDevice = deviceNodes.get(relation.to.id);
    const child = childAsset ?? childDevice;

    if (!parent || !child || parent.id === child.id) continue;

    parent.children.push(child);
    childIds.add(child.id);
  }

  const roots: HierarchyNode[] = [];

  for (const node of assetNodes.values()) {
    if (!childIds.has(node.id)) {
      roots.push(node);
    }
  }

  for (const node of deviceNodes.values()) {
    if (!childIds.has(node.id)) {
      roots.push(node);
    }
  }

  const buildings = roots.filter((n) => n.kind === "building");
  const sorted = (buildings.length > 0 ? buildings : roots).sort((a, b) =>
    a.name.localeCompare(b.name, "de"),
  );

  for (const node of sorted) {
    enrichNodeStats(node);
  }

  return sorted;
}

function inferDeviceStatus(telemetry?: LatestTelemetry): HierarchyNode["status"] {
  if (!telemetry?.temperature && !telemetry?.targetTemperature) {
    return "offline";
  }
  if (telemetry.battery !== undefined && telemetry.battery < 2.8) {
    return "low_battery";
  }
  return "active";
}

function enrichNodeStats(node: HierarchyNode): void {
  node.children.sort((a, b) => a.name.localeCompare(b.name, "de"));

  let roomCount = 0;
  let deviceCount = 0;
  let activeDeviceCount = 0;

  for (const child of node.children) {
    enrichNodeStats(child);
    if (child.kind === "room") roomCount += 1;
    if (child.kind === "device") {
      deviceCount += 1;
      if (child.status === "active") activeDeviceCount += 1;
    }
    roomCount += child.roomCount ?? 0;
    deviceCount += child.deviceCount ?? 0;
    activeDeviceCount += child.activeDeviceCount ?? 0;
  }

  node.roomCount = roomCount;
  node.deviceCount = deviceCount;
  node.activeDeviceCount = activeDeviceCount;
}

export function findNodeById(
  roots: HierarchyNode[],
  id: string,
): HierarchyNode | null {
  for (const root of roots) {
    if (root.id === id) return root;
    const found = findNodeInChildren(root, id);
    if (found) return found;
  }
  return null;
}

function findNodeInChildren(node: HierarchyNode, id: string): HierarchyNode | null {
  for (const child of node.children) {
    if (child.id === id) return child;
    const found = findNodeInChildren(child, id);
    if (found) return found;
  }
  return null;
}

export function getBuildings(roots: HierarchyNode[]): HierarchyNode[] {
  const buildings = roots.filter((n) => n.kind === "building");
  return buildings.length > 0 ? buildings : roots;
}

export function getFloors(node: HierarchyNode): HierarchyNode[] {
  const floors = node.children.filter((c) => c.kind === "floor");
  if (floors.length > 0) return floors;
  return node.children.filter(
    (c) => c.kind === "room" || c.kind === "device" || c.kind === "unknown",
  );
}

export function getRooms(node: HierarchyNode): HierarchyNode[] {
  return node.children.filter((c) => c.kind === "room" || c.kind === "device");
}

export function getDevices(node: HierarchyNode): HierarchyNode[] {
  const direct = node.children.filter((c) => c.kind === "device");
  if (direct.length > 0) return direct;
  if (node.kind === "device") return [node];
  return [];
}

export function collectDevices(node: HierarchyNode): HierarchyNode[] {
  const devices: HierarchyNode[] = [];
  if (node.kind === "device") devices.push(node);
  for (const child of node.children) {
    devices.push(...collectDevices(child));
  }
  return devices;
}

export function averageTemperature(devices: HierarchyNode[]): number | undefined {
  const values = devices
    .map((d) => d.telemetry?.temperature)
    .filter((v): v is number => v !== undefined);
  if (values.length === 0) return undefined;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
