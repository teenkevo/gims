"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SecurityDepartmentRecord } from "@/sanity/lib/departments/getSecurityDepartments";
import { fetchSecurityDepartments } from "@/lib/auth/security-tab-actions";
import { DepartmentsManager } from "./departments-manager";
import { SecurityTabLoading } from "./security-tab-loading";

interface DepartmentsTabProps {
  canManage: boolean;
}

export function DepartmentsTab({ canManage }: DepartmentsTabProps) {
  const [departments, setDepartments] = useState<SecurityDepartmentRecord[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadDepartments = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const data = await fetchSecurityDepartments();
      setDepartments(data);
    } catch {
      toast.error("Failed to load departments");
      if (!silent) {
        setDepartments([]);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const refreshDepartments = useCallback(() => {
    loadDepartments(true);
  }, [loadDepartments]);

  if (isLoading || departments === null) {
    return <SecurityTabLoading />;
  }

  return (
    <DepartmentsManager
      departments={departments}
      canManage={canManage}
      onDepartmentsChange={refreshDepartments}
    />
  );
}
