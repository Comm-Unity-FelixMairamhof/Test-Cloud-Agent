export type NavTab = "home" | "favorites" | "settings";

type BottomNavProps = {
  active: NavTab;
  onChange: (tab: NavTab) => void;
};

const TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: "home", label: "Übersicht", icon: "⌂" },
  { id: "favorites", label: "Favoriten", icon: "★" },
  { id: "settings", label: "Profil", icon: "◎" },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Hauptnavigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bottom-nav__item ${active === tab.id ? "bottom-nav__item--active" : ""}`}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          <span className="bottom-nav__icon" aria-hidden>
            {tab.icon}
          </span>
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
