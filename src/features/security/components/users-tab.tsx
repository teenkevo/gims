"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { PersonnelAccessRow } from "@/lib/auth/security-data";
import {
  fetchSecurityUserFilterOptions,
  fetchSecurityUsers,
  type SecurityUserFilterOption,
} from "@/lib/auth/security-tab-actions";
import { SecurityTabLoading } from "./security-tab-loading";
import { UsersDataTable } from "./users-table/data-table";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UsersTab() {
  const [users, setUsers] = useState<PersonnelAccessRow[] | null>(null);
  const [filterOptions, setFilterOptions] = useState<
    SecurityUserFilterOption[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, filters] = await Promise.all([
        fetchSecurityUsers(),
        fetchSecurityUserFilterOptions(),
      ]);
      setUsers(data);
      setFilterOptions(filters);
    } catch {
      toast.error("Failed to load users");
      setUsers([]);
      setFilterOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (isLoading || users === null || filterOptions === null) {
    return <SecurityTabLoading />;
  }

  return (
    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Personnel onboarded in HR with their departmental roles and invitation
          status.
        </CardDescription>
      </CardHeader>
      <div className="px-6 pb-6">
        <UsersDataTable data={users} filterOptions={filterOptions} />
      </div>
    </div>
  );
}
