"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RolesTab } from "./roles-tab";
import { UsersTab } from "./users-tab";
import { AuditLogTab } from "./audit-log-tab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const SECURITY_TABS = ["roles", "users", "audit-log"] as const;
type SecurityTab = (typeof SECURITY_TABS)[number];

function isSecurityTab(value: string | null): value is SecurityTab {
  return SECURITY_TABS.includes(value as SecurityTab);
}

interface SecurityViewProps {
  canManageRoles: boolean;
}

export function SecurityView({ canManageRoles }: SecurityViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = isSecurityTab(tabParam) ? tabParam : "roles";

  const [activeTab, setActiveTab] = useState<SecurityTab>(initialTab);
  const [loadedTabs, setLoadedTabs] = useState(
    () => new Set<SecurityTab>([initialTab])
  );

  useEffect(() => {
    if (tabParam === "departments") {
      router.replace("/departments");
      return;
    }

    const nextTab = isSecurityTab(tabParam) ? tabParam : "roles";
    setActiveTab(nextTab);
    setLoadedTabs((current) => new Set(current).add(nextTab));

    if (!isSecurityTab(tabParam)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "roles");
      router.replace(`/security?${params.toString()}`);
    }
  }, [tabParam, router, searchParams]);

  const handleTabChange = (value: string) => {
    if (!isSecurityTab(value)) return;

    setActiveTab(value);
    setLoadedTabs((current) => new Set(current).add(value));

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`/security?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage permission sets, user access, and audit activity.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="roles">Permission sets</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit-log">Audit log</TabsTrigger>
        </TabsList>

        {loadedTabs.has("roles") && (
          <div className={cn("mt-0", activeTab !== "roles" && "hidden")}>
            <RolesTab canManage={canManageRoles} />
          </div>
        )}
        {loadedTabs.has("users") && (
          <div className={cn("mt-0", activeTab !== "users" && "hidden")}>
            <UsersTab />
          </div>
        )}
        {loadedTabs.has("audit-log") && (
          <div className={cn("mt-0", activeTab !== "audit-log" && "hidden")}>
            <AuditLogTab />
          </div>
        )}
      </Tabs>
    </div>
  );
}
