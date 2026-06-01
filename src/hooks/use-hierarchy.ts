"use client";

import { useCallback, useEffect, useState } from "react";
import { ThingsBoardApiError } from "@/lib/thingsboard/client";
import { loadCustomerHierarchy } from "@/lib/thingsboard/hierarchy";
import { useAuth } from "@/contexts/auth-context";
import type { HierarchyNode } from "@/types/entities";

type HierarchyState = {
  roots: HierarchyNode[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useHierarchy(): HierarchyState {
  const { user } = useAuth();
  const [roots, setRoots] = useState<HierarchyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = user?.customerId?.id;

  const loadHierarchy = useCallback(async () => {
    if (!customerId) {
      setRoots([]);
      setError(
        "Ihrem Konto ist kein Kunde zugeordnet. Bitte wenden Sie sich an den Administrator.",
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tree = await loadCustomerHierarchy(customerId);
      setRoots(tree);
      if (tree.length === 0) {
        setError("Keine Gebäude gefunden. Bitte prüfen Sie Ihre ThingsBoard-Zuordnung.");
      }
    } catch (err) {
      const message =
        err instanceof ThingsBoardApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Daten konnten nicht geladen werden.";
      setError(message);
      setRoots([]);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!customerId) {
        if (!cancelled) {
          setRoots([]);
          setError(
            "Ihrem Konto ist kein Kunde zugeordnet. Bitte wenden Sie sich an den Administrator.",
          );
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const tree = await loadCustomerHierarchy(customerId);
        if (cancelled) return;
        setRoots(tree);
        if (tree.length === 0) {
          setError("Keine Gebäude gefunden. Bitte prüfen Sie Ihre ThingsBoard-Zuordnung.");
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ThingsBoardApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Daten konnten nicht geladen werden.";
        setError(message);
        setRoots([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  return { roots, isLoading, error, refetch: loadHierarchy };
}
