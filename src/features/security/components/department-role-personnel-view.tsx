"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import type { SecurityDepartmentRecord } from "@/sanity/lib/departments/getSecurityDepartments";
import type { DepartmentDetail } from "@/sanity/lib/departments/getDepartmentDetail";
import { fetchDepartmentDetail } from "@/lib/auth/security-tab-actions";
import { getPermissionSetIdsForDepartmentRole } from "@/lib/auth/department-role-permission-sets";
import { CreateDepartmentPersonnelDialog } from "./create-department-personnel-dialog";
import { RolePermissionSetsPanel } from "./role-permission-sets-panel";
import { SecurityTabLoading } from "./security-tab-loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DepartmentRolePersonnelViewProps {
  department: SecurityDepartmentRecord;
  selectedRole: string;
  onBack: () => void;
  canManage: boolean;
  onPersonnelChange?: () => void;
}

const underlineTabsListClassName =
  "h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0";

const underlineTabsTriggerClassName = cn(
  "rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 shadow-none",
  "text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent",
  "data-[state=active]:text-foreground data-[state=active]:shadow-none"
);

export function DepartmentRolePersonnelView({
  department,
  selectedRole,
  onBack,
  canManage,
  onPersonnelChange,
}: DepartmentRolePersonnelViewProps) {
  const [detail, setDetail] = useState<DepartmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const loadDetail = async (departmentId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchDepartmentDetail(departmentId);
      setDetail(data);
    } catch {
      toast.error("Failed to load department");
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail(department._id);
  }, [department._id]);

  const departmentRoles = useMemo(
    () =>
      detail?.roles
        .map((entry) => entry.roleName)
        .filter((name): name is string => Boolean(name)) ?? [],
    [detail]
  );

  const personnel = useMemo(
    () =>
      detail?.personnel.filter((person) => person.role === selectedRole) ?? [],
    [detail, selectedRole]
  );

  const roleEntry = useMemo(
    () => detail?.roles.find((entry) => entry.roleName === selectedRole),
    [detail, selectedRole]
  );

  const permissionSetIds = useMemo(
    () => getPermissionSetIdsForDepartmentRole(roleEntry),
    [roleEntry]
  );

  const handlePersonnelChange = () => {
    loadDetail(department._id);
    onPersonnelChange?.();
  };

  return (
    <>
      <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
        <div className="px-6 pt-5 pb-5">
          <Button
            variant="outline"
            size="sm"
            className="-ml-2 h-8 px-2 text-muted-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {department.department} roles
          </Button>
        </div>

        <CardHeader className="space-y-1 pt-2">
          <CardTitle>{selectedRole}</CardTitle>
          <CardDescription>
            Manage personnel and permission sets for this role.
          </CardDescription>
        </CardHeader>

        <div className="px-6 pb-6">
          {isLoading || !detail ? (
            <SecurityTabLoading />
          ) : (
            <Tabs defaultValue="personnel">
              <TabsList className={underlineTabsListClassName}>
                <TabsTrigger
                  value="personnel"
                  className={underlineTabsTriggerClassName}
                >
                  Personnel
                </TabsTrigger>
                <TabsTrigger
                  value="permission-sets"
                  className={underlineTabsTriggerClassName}
                >
                  Permission sets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personnel" className="mt-4">
                {canManage && (
                  <div className="mb-4 flex justify-end">
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add personnel
                    </Button>
                  </div>
                )}
                <div className="rounded-md border bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>App access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {personnel.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No personnel assigned to this role yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        personnel.map((person) => (
                          <TableRow key={person._id}>
                            <TableCell className="font-medium">
                              {person.fullName}
                            </TableCell>
                            <TableCell>{person.email}</TableCell>
                            <TableCell className="capitalize">
                              {person.status}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {person.appAccessStatus ?? "none"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="permission-sets" className="mt-4">
                <RolePermissionSetsPanel
                  departmentId={detail._id}
                  roleName={selectedRole}
                  selectedAppRoleIds={permissionSetIds}
                  canManage={canManage}
                  onSuccess={handlePersonnelChange}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {detail && (
        <CreateDepartmentPersonnelDialog
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            handlePersonnelChange();
          }}
          departmentName={department.department}
          departmentId={detail._id}
          roles={departmentRoles}
          defaultRole={selectedRole}
        />
      )}
    </>
  );
}
