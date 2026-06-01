import { fetchCustomerAssets, fetchCustomerDevices } from "@/lib/thingsboard/assets";
import { fetchCustomerHierarchyRelations } from "@/lib/thingsboard/relations";
import { fetchBatchDeviceTelemetry } from "@/lib/thingsboard/telemetry";
import { buildHierarchyTree } from "@/lib/utils/hierarchy";
import type { HierarchyNode } from "@/types/entities";

export async function loadCustomerHierarchy(
  customerId: string,
): Promise<HierarchyNode[]> {
  const [assets, devices, relations] = await Promise.all([
    fetchCustomerAssets(customerId),
    fetchCustomerDevices(customerId),
    fetchCustomerHierarchyRelations(customerId),
  ]);

  const deviceIds = devices.map((d) => d.id.id);
  const telemetryByDeviceId = await fetchBatchDeviceTelemetry(deviceIds);

  return buildHierarchyTree(assets, devices, relations, telemetryByDeviceId);
}
