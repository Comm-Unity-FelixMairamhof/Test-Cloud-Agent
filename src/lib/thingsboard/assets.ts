import { authorizedJson } from "@/lib/thingsboard/client";
import type { AssetInfo, DeviceInfo, EntityId, EntityQueryPageData } from "@/types/entities";

type PageResponse<T> = {
  data: T[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
};

type AssetInfoDto = {
  id: { id: string; entityType: string };
  name: string;
  type: string;
  label?: string;
  customerId?: { id: string; entityType: string };
};

type DeviceInfoDto = {
  id: { id: string; entityType: string };
  name: string;
  type: string;
  label?: string;
  customerId?: { id: string; entityType: string };
};

function mapAsset(dto: AssetInfoDto): AssetInfo {
  return {
    id: { id: dto.id.id, entityType: "ASSET" },
    name: dto.name,
    type: dto.type,
    label: dto.label,
    customerId: dto.customerId
      ? mapEntityId(dto.customerId)
      : undefined,
  };
}

function mapEntityId(dto: { id: string; entityType: string }): EntityId {
  return {
    id: dto.id,
    entityType: dto.entityType as EntityId["entityType"],
  };
}

function mapDevice(dto: DeviceInfoDto): DeviceInfo {
  return {
    id: { id: dto.id.id, entityType: "DEVICE" },
    name: dto.name,
    type: dto.type,
    label: dto.label,
    customerId: dto.customerId ? mapEntityId(dto.customerId) : undefined,
  };
}

export async function fetchCustomerAssets(customerId: string): Promise<AssetInfo[]> {
  const page = await authorizedJson<PageResponse<AssetInfoDto>>(
    `/api/customer/${customerId}/assetInfos?pageSize=500&page=0&sortProperty=name&sortOrder=ASC`,
  );
  return page.data.map(mapAsset);
}

export async function fetchCustomerDevices(customerId: string): Promise<DeviceInfo[]> {
  const page = await authorizedJson<PageResponse<DeviceInfoDto>>(
    `/api/customer/${customerId}/deviceInfos?pageSize=500&page=0&sortProperty=name&sortOrder=ASC`,
  );
  return page.data.map(mapDevice);
}

export async function fetchAssetsByEntityQuery(
  customerId: string,
  assetTypes: string[] = [],
): Promise<AssetInfo[]> {
  const body = {
    entityFilter: {
      type: "assetSearchQuery",
      rootEntity: { entityType: "CUSTOMER", id: customerId },
      relationType: "Contains",
      direction: "FROM",
      maxLevel: 10,
      fetchLastLevelOnly: false,
      assetTypes,
    },
    pageLink: {
      page: 0,
      pageSize: 500,
      sortOrder: {
        key: { type: "ENTITY_FIELD", key: "name" },
        direction: "ASC",
      },
    },
    entityFields: [
      { type: "ENTITY_FIELD", key: "name" },
      { type: "ENTITY_FIELD", key: "type" },
      { type: "ENTITY_FIELD", key: "label" },
    ],
  };

  const result = await authorizedJson<EntityQueryPageData>(`/api/entitiesQuery/find`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return result.data.map((row) => ({
    id: { id: row.entityId.id, entityType: "ASSET" as const },
    name: String((row as { name?: string }).name ?? "Unbenannt"),
    type: String((row as { type?: string }).type ?? "unknown"),
  }));
}
