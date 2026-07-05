"use client";

import { useCallback, useState } from "react";
import { useUnsavedChanges } from "@/components/unsaved-changes/unsaved-changes-context";

function updateTabUrl(tab: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.pushState({}, "", url);
}

export function useGuardedTabChange(
  activeTab: string,
  setActiveTab: (tab: string) => void
) {
  const { hasUnsavedChanges, discardChanges } = useUnsavedChanges();
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const applyTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      updateTabUrl(tab);
    },
    [setActiveTab]
  );

  const requestTabChange = useCallback(
    (tab: string) => {
      if (tab === activeTab) return;

      if (hasUnsavedChanges) {
        setPendingTab(tab);
        setShowUnsavedDialog(true);
        return;
      }

      applyTabChange(tab);
    },
    [activeTab, applyTabChange, hasUnsavedChanges]
  );

  const confirmDiscard = useCallback(() => {
    discardChanges();
    setShowUnsavedDialog(false);

    if (pendingTab) {
      applyTabChange(pendingTab);
      setPendingTab(null);
    }
  }, [applyTabChange, discardChanges, pendingTab]);

  const cancelDiscard = useCallback(() => {
    setShowUnsavedDialog(false);
    setPendingTab(null);
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setShowUnsavedDialog(true);
        return;
      }
      cancelDiscard();
    },
    [cancelDiscard]
  );

  return {
    requestTabChange,
    showUnsavedDialog,
    handleDialogOpenChange,
    confirmDiscard,
    cancelDiscard,
  };
}
