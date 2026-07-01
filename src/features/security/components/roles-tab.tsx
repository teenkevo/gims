"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { AppRoleRecord } from "@/sanity/lib/auth/getAllAppRoles";
import { fetchSecurityRoles } from "@/lib/auth/security-tab-actions";
import { RolesManager } from "./roles-manager";
import { SecurityTabLoading } from "./security-tab-loading";

interface RolesTabProps {
  canManage: boolean;
}

export function RolesTab({ canManage }: RolesTabProps) {
  const [roles, setRoles] = useState<AppRoleRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSecurityRoles();
      setRoles(data);
    } catch {
      toast.error("Failed to load permission sets");
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  if (isLoading || roles === null) {
    return <SecurityTabLoading />;
  }

  return (
    <RolesManager
      roles={roles}
      canManage={canManage}
      onRolesChange={loadRoles}
    />
  );
}
