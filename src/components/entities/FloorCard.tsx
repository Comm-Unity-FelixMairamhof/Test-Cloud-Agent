import type { HierarchyNode } from "@/types/entities";

type FloorCardProps = {
  floor: HierarchyNode;
  onSelect: () => void;
};

export function FloorCard({ floor, onSelect }: FloorCardProps) {
  const rooms = floor.roomCount ?? floor.children.length;

  return (
    <button type="button" className="entity-card entity-card--floor" onClick={onSelect}>
      <div className="entity-card__header">
        <div>
          <p className="entity-card__eyebrow">Stockwerk</p>
          <h3 className="entity-card__title">{floor.name}</h3>
        </div>
        <span className="entity-card__pill">{rooms} Räume</span>
      </div>
      <span className="entity-card__chevron" aria-hidden>
        →
      </span>
    </button>
  );
}
