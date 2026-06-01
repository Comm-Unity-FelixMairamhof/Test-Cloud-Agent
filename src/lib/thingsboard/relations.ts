import { authorizedJson } from "@/lib/thingsboard/client";
import type { EntityId, RelationInfo } from "@/types/entities";

type RelationDto = {
  from: EntityId;
  to: EntityId;
  type: string;
  typeGroup?: string;
};

export async function fetchRelationsFromEntity(
  entityId: EntityId,
  maxLevel = 5,
): Promise<RelationInfo[]> {
  const body = {
    parameters: {
      entityId,
      direction: "FROM",
      relationTypeGroup: "COMMON",
      maxLevel,
    },
    filters: [
      {
        relationType: "Contains",
        entityTypes: ["ASSET", "DEVICE"],
      },
    ],
  };

  try {
    const relations = await authorizedJson<RelationDto[]>(`/api/relations/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return relations.map((r) => ({
      from: r.from,
      to: r.to,
      type: r.type,
      typeGroup: r.typeGroup,
    }));
  } catch {
    return fetchRelationsFallback(entityId);
  }
}

async function fetchRelationsFallback(entityId: EntityId): Promise<RelationInfo[]> {
  const params = new URLSearchParams({
    fromId: entityId.id,
    fromType: entityId.entityType,
    relationType: "Contains",
  });

  const relations = await authorizedJson<RelationDto[]>(`/api/relations?${params}`);
  return relations.map((r) => ({
    from: r.from,
    to: r.to,
    type: r.type,
    typeGroup: r.typeGroup,
  }));
}

export async function fetchCustomerHierarchyRelations(
  customerId: string,
): Promise<RelationInfo[]> {
  const body = {
    parameters: {
      entityId: { entityType: "CUSTOMER", id: customerId },
      direction: "FROM",
      relationTypeGroup: "COMMON",
      maxLevel: 10,
    },
    filters: [
      {
        relationType: "Contains",
        entityTypes: ["ASSET", "DEVICE"],
      },
    ],
  };

  try {
    const relations = await authorizedJson<RelationDto[]>(`/api/relations/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return relations.map((r) => ({
      from: r.from,
      to: r.to,
      type: r.type,
      typeGroup: r.typeGroup,
    }));
  } catch {
    return [];
  }
}
