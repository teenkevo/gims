"use client";

import { toast } from "sonner";
import { getActionErrorMessage } from "./action-errors";

export function toastActionError(
  result: { status?: string; error?: unknown } | null | undefined,
  fallback = "Something went wrong"
) {
  if (result?.status === "error") {
    toast.error(getActionErrorMessage(result, fallback));
  }
}
