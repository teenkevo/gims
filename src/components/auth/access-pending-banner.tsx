"use client";

import { useRBAC } from "@/components/rbac-context";
import { USER_TYPES } from "@/lib/auth/user-type";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export function AccessPendingBanner() {
  const { userType, accessLabel, isAuthenticated } = useRBAC();

  if (!isAuthenticated || userType !== USER_TYPES.PENDING) {
    return null;
  }

  const isClientPending =
    accessLabel?.toLowerCase().includes("portal") ||
    accessLabel === "Pending approval";

  return (
    <Alert className="mb-6">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>{accessLabel ?? "Access pending"}</AlertTitle>
      <AlertDescription>
        {isClientPending
          ? "Your account is signed in but portal access has not been granted yet, or it has been revoked. Contact your GETLAB representative to be invited to the client portal."
          : "Your account is signed in but HR has not onboarded you as personnel yet, or your access has been revoked. Contact HR to be added with a departmental role."}
      </AlertDescription>
    </Alert>
  );
}
