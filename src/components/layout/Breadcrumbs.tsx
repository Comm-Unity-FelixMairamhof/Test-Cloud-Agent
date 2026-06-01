import type { BreadcrumbItem } from "@/types/entities";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
};

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  return (
    <nav className="breadcrumbs" aria-label="Hierarchie">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.kind}-${item.id}`} className="breadcrumbs__item">
              {index > 0 && (
                <span className="breadcrumbs__sep" aria-hidden>
                  ›
                </span>
              )}
              {isLast ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  className="breadcrumbs__link"
                  onClick={() => onNavigate(item)}
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
