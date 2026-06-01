"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { BottomNav, type NavTab } from "@/components/layout/BottomNav";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BuildingCard } from "@/components/entities/BuildingCard";
import { DeviceCard } from "@/components/entities/DeviceCard";
import { FloorCard } from "@/components/entities/FloorCard";
import { RoomCard } from "@/components/entities/RoomCard";
import { DeviceDetailPanel } from "@/components/dashboard/DeviceDetailPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/contexts/auth-context";
import { useHierarchy } from "@/hooks/use-hierarchy";
import {
  averageTemperature,
  collectDevices,
  findNodeById,
  getBuildings,
  getDevices,
  getFloors,
  getRooms,
} from "@/lib/utils/hierarchy";
import { getGreeting, getUserDisplayName } from "@/lib/utils/format";
import type { BreadcrumbItem, HierarchyNode } from "@/types/entities";

type ViewLevel = "buildings" | "floors" | "rooms" | "devices" | "device-detail";

type NavigationState = {
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  deviceId?: string;
};

function getViewLevel(nav: NavigationState): ViewLevel {
  if (nav.deviceId) return "device-detail";
  if (nav.roomId) return "devices";
  if (nav.floorId) return "rooms";
  if (nav.buildingId) return "floors";
  return "buildings";
}

export function DashboardApp() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { roots, isLoading, error, refetch } = useHierarchy();
  const [nav, setNav] = useState<NavigationState>({});
  const [search, setSearch] = useState("");
  const [navTab, setNavTab] = useState<NavTab>("home");
  const [favorites, setFavorites] = useState<string[]>([]);

  const buildings = useMemo(() => getBuildings(roots), [roots]);

  const currentBuilding = nav.buildingId
    ? findNodeById(roots, nav.buildingId)
    : null;
  const currentFloor = nav.floorId ? findNodeById(roots, nav.floorId) : null;
  const currentRoom = nav.roomId ? findNodeById(roots, nav.roomId) : null;
  const currentDevice = nav.deviceId ? findNodeById(roots, nav.deviceId) : null;

  const viewLevel = getViewLevel(nav);

  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [{ id: "root", label: "Gebäude", kind: "root" }];
    if (currentBuilding) {
      items.push({ id: currentBuilding.id, label: currentBuilding.name, kind: "building" });
    }
    if (currentFloor) {
      items.push({ id: currentFloor.id, label: currentFloor.name, kind: "floor" });
    }
    if (currentRoom) {
      items.push({ id: currentRoom.id, label: currentRoom.name, kind: "room" });
    }
    if (currentDevice && viewLevel === "device-detail") {
      items.push({ id: currentDevice.id, label: currentDevice.name, kind: "device" });
    }
    return items;
  }, [currentBuilding, currentFloor, currentRoom, currentDevice, viewLevel]);

  function handleBreadcrumbNavigate(item: BreadcrumbItem) {
    if (item.kind === "root") {
      setNav({});
      return;
    }
    if (item.kind === "building") {
      setNav({ buildingId: item.id });
      return;
    }
    if (item.kind === "floor") {
      setNav({ buildingId: nav.buildingId, floorId: item.id });
      return;
    }
    if (item.kind === "room") {
      setNav({ buildingId: nav.buildingId, floorId: nav.floorId, roomId: item.id });
    }
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const results: HierarchyNode[] = [];

    function walk(node: HierarchyNode) {
      if (node.name.toLowerCase().includes(q)) results.push(node);
      node.children.forEach(walk);
    }

    roots.forEach(walk);
    return results.slice(0, 8);
  }, [roots, search]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function renderHomeContent() {
    if (isLoading) {
      return <LoadingState label="Gebäude und Geräte werden geladen …" />;
    }

    if (error && buildings.length === 0) {
      return <ErrorState message={error} onRetry={() => void refetch()} />;
    }

    if (viewLevel === "device-detail" && currentDevice?.kind === "device") {
      return (
        <DeviceDetailPanel
          key={currentDevice.id}
          device={currentDevice}
          onBack={() =>
            setNav({
              buildingId: nav.buildingId,
              floorId: nav.floorId,
              roomId: nav.roomId,
            })
          }
          onSaved={() => void refetch()}
        />
      );
    }

    if (viewLevel === "buildings") {
      if (buildings.length === 0) {
        return (
          <EmptyState
            title="Keine Gebäude"
            description="Für Ihr Konto wurden noch keine Gebäude in ThingsBoard zugewiesen."
          />
        );
      }

      return (
        <div className="entity-grid">
          {buildings.map((building) => {
            const devices = collectDevices(building);
            return (
              <BuildingCard
                key={building.id}
                building={building}
                avgTemp={averageTemperature(devices)}
                onSelect={() => setNav({ buildingId: building.id })}
              />
            );
          })}
        </div>
      );
    }

    if (viewLevel === "floors" && currentBuilding) {
      const floors = getFloors(currentBuilding);
      if (floors.length === 0) {
        const rooms = getRooms(currentBuilding);
        if (rooms.length > 0) {
          return (
            <div className="entity-grid">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onSelect={() =>
                    setNav({ buildingId: nav.buildingId, roomId: room.id })
                  }
                />
              ))}
            </div>
          );
        }
        return (
          <EmptyState
            title="Keine Stockwerke"
            description="Dieses Gebäude enthält noch keine Stockwerke oder Räume."
          />
        );
      }

      return (
        <div className="entity-grid">
          {floors.map((floor) => (
            <FloorCard
              key={floor.id}
              floor={floor}
              onSelect={() =>
                setNav({ buildingId: nav.buildingId, floorId: floor.id })
              }
            />
          ))}
        </div>
      );
    }

    if (viewLevel === "rooms" && currentFloor) {
      const rooms = getRooms(currentFloor);
      if (rooms.length === 0) {
        return (
          <EmptyState
            title="Keine Räume"
            description="Auf diesem Stockwerk sind noch keine Räume angelegt."
          />
        );
      }

      return (
        <div className="entity-grid">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onSelect={() =>
                setNav({
                  buildingId: nav.buildingId,
                  floorId: nav.floorId,
                  roomId: room.id,
                })
              }
            />
          ))}
        </div>
      );
    }

    if (viewLevel === "devices") {
      const container = currentRoom ?? currentFloor ?? currentBuilding;
      if (!container) return null;

      const devices = getDevices(container);
      const rooms =
        devices.length === 0 ? getRooms(container).filter((r) => r.kind === "room") : [];

      if (devices.length > 0) {
        return (
          <div className="entity-grid">
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                onSelect={() =>
                  setNav({
                    buildingId: nav.buildingId,
                    floorId: nav.floorId,
                    roomId: nav.roomId,
                    deviceId: device.id,
                  })
                }
              />
            ))}
          </div>
        );
      }

      if (rooms.length > 0) {
        return (
          <div className="entity-grid">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={() =>
                  setNav({
                    buildingId: nav.buildingId,
                    floorId: nav.floorId,
                    roomId: room.id,
                  })
                }
              />
            ))}
          </div>
        );
      }

      return (
        <EmptyState
          title="Keine Heizkörper"
          description="In diesem Bereich sind noch keine Geräte zugeordnet."
        />
      );
    }

    return null;
  }

  function renderFavorites() {
    const favNodes = favorites
      .map((id) => findNodeById(roots, id))
      .filter((n): n is HierarchyNode => n !== null);

    if (favNodes.length === 0) {
      return (
        <EmptyState
          title="Noch keine Favoriten"
          description="Tippen Sie auf ★ bei einem Raum, um ihn hier zu speichern."
        />
      );
    }

    return (
      <div className="entity-grid">
        {favNodes.map((node) => (
          <RoomCard
            key={node.id}
            room={node}
            onSelect={() => {
              setNavTab("home");
              if (node.kind === "device") {
                setNav({ deviceId: node.id });
              } else {
                setNav({ roomId: node.id });
              }
            }}
          />
        ))}
      </div>
    );
  }

  function renderSettings() {
    return (
      <section className="settings-panel">
        <h2 className="settings-panel__title">Profil</h2>
        <dl className="settings-panel__list">
          <div>
            <dt>Name</dt>
            <dd>{getUserDisplayName(user?.firstName, user?.lastName, user?.email)}</dd>
          </div>
          <div>
            <dt>E-Mail</dt>
            <dd>{user?.email ?? "—"}</dd>
          </div>
        </dl>
        <button type="button" className="app-btn app-btn--ghost" onClick={() => void handleLogout()}>
          Abmelden
        </button>
      </section>
    );
  }

  const sectionTitle =
    viewLevel === "buildings"
      ? "Ihre Gebäude"
      : viewLevel === "floors"
        ? currentBuilding?.name
        : viewLevel === "rooms"
          ? currentFloor?.name
          : viewLevel === "devices"
            ? currentRoom?.name ?? "Heizkörper"
            : currentDevice?.name;

  return (
    <AppShell
      header={
        <header className="app-header">
          <div className="app-header__top">
            <div>
              <p className="app-header__greeting">{getGreeting()}</p>
              <h1 className="app-header__title">
                {getUserDisplayName(user?.firstName, user?.lastName, user?.email)}
              </h1>
            </div>
            <div className="app-header__brand" aria-hidden>
              IW
            </div>
          </div>

          {navTab === "home" && viewLevel !== "device-detail" && (
            <>
              <div className="search-bar">
                <input
                  type="search"
                  className="search-bar__input"
                  placeholder="Raum oder Gebäude suchen …"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Suche"
                />
              </div>
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map((node) => (
                    <li key={node.id}>
                      <button
                        type="button"
                        className="search-results__item"
                        onClick={() => {
                          setSearch("");
                          if (node.kind === "building") setNav({ buildingId: node.id });
                          else if (node.kind === "floor")
                            setNav({ floorId: node.id, buildingId: nav.buildingId });
                          else if (node.kind === "room")
                            setNav({ roomId: node.id });
                          else if (node.kind === "device")
                            setNav({ deviceId: node.id });
                        }}
                      >
                        <span>{node.name}</span>
                        <span className="search-results__kind">{node.kind}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Breadcrumbs items={breadcrumbs} onNavigate={handleBreadcrumbNavigate} />
            </>
          )}
        </header>
      }
      footer={<BottomNav active={navTab} onChange={setNavTab} />}
    >
      {navTab === "home" && (
        <>
          {viewLevel !== "device-detail" && sectionTitle && (
            <div className="section-header">
              <h2 className="section-header__title">{sectionTitle}</h2>
              {currentRoom && (
                <button
                  type="button"
                  className={`fav-btn ${favorites.includes(currentRoom.id) ? "fav-btn--active" : ""}`}
                  onClick={() => toggleFavorite(currentRoom.id)}
                  aria-label="Raum als Favorit speichern"
                >
                  ★
                </button>
              )}
            </div>
          )}
          {renderHomeContent()}
        </>
      )}
      {navTab === "favorites" && renderFavorites()}
      {navTab === "settings" && renderSettings()}
    </AppShell>
  );
}
