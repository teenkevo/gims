"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type UnsavedChangesContextValue = {
  hasUnsavedChanges: boolean;
  resetKey: number;
  setDirty: (id: string, dirty: boolean) => void;
  discardChanges: () => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(
  null
);

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});
  const [resetKey, setResetKey] = useState(0);

  const setDirty = useCallback((id: string, dirty: boolean) => {
    setDirtyMap((prev) => {
      if (!dirty) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }

      if (prev[id] === true) return prev;
      return { ...prev, [id]: true };
    });
  }, []);

  const discardChanges = useCallback(() => {
    setDirtyMap({});
    setResetKey((key) => key + 1);
  }, []);

  const hasUnsavedChanges = Object.values(dirtyMap).some(Boolean);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const value = useMemo(
    () => ({
      hasUnsavedChanges,
      resetKey,
      setDirty,
      discardChanges,
    }),
    [hasUnsavedChanges, resetKey, setDirty, discardChanges]
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error(
      "useUnsavedChanges must be used within UnsavedChangesProvider"
    );
  }
  return context;
}

/** Register a form field group as dirty; returns resetKey to revert local form state. */
export function useRegisterUnsavedChanges(
  id: string | undefined,
  isDirty: boolean
) {
  const { setDirty, resetKey } = useUnsavedChanges();

  useEffect(() => {
    if (!id) return;
    setDirty(id, isDirty);
    return () => setDirty(id, false);
  }, [id, isDirty, setDirty]);

  return resetKey;
}
