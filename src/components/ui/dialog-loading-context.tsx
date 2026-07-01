"use client";

import * as React from "react";

const DialogLoadingContext = React.createContext(false);

export const DialogLoadingProvider = DialogLoadingContext.Provider;

export function useDialogLoading() {
  return React.useContext(DialogLoadingContext);
}

export function useBlockingOpenChange(
  loading: boolean,
  onOpenChange?: (open: boolean) => void
) {
  const loadingRef = React.useRef(loading);
  loadingRef.current = loading;

  return React.useCallback(
    (open: boolean) => {
      if (loadingRef.current && !open) return;
      onOpenChange?.(open);
    },
    [onOpenChange]
  );
}
