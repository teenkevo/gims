"use client";

import { useState } from "react";
import { RolesTab } from "./roles-tab";
import { UsersTab } from "./users-tab";
import { AuditLogTab } from "./audit-log-tab";
import { DepartmentsTab } from "./departments-tab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface SecurityViewProps {
  canManageRoles: boolean;
}

export function SecurityView({ canManageRoles }: SecurityViewProps) {
  const [activeTab, setActiveTab] = useState("roles");
  const [loadedTabs, setLoadedTabs] = useState(() => new Set(["roles"]));

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLoadedTabs((current) => new Set(current).add(value));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage permission sets, departments, user access, and audit activity.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="roles">Permission sets</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="audit-log">Audit log</TabsTrigger>
        </TabsList>

        {loadedTabs.has("roles") && (
          <div className={cn("mt-0", activeTab !== "roles" && "hidden")}>
            <RolesTab canManage={canManageRoles} />
          </div>
        )}
        {loadedTabs.has("departments") && (
          <div className={cn("mt-0", activeTab !== "departments" && "hidden")}>
            <DepartmentsTab canManage={canManageRoles} />
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
