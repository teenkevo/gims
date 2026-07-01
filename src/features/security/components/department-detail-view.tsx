import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import type { SecurityDepartmentRecord } from "@/sanity/lib/departments/getSecurityDepartments";
import type { DepartmentDetail } from "@/sanity/lib/departments/getDepartmentDetail";
import { fetchDepartmentDetail } from "@/lib/auth/security-tab-actions";
import { CreatePersonnelDialog } from "@/features/internal/personnel/components/create-personnel-dialog";
import { SecurityTabLoading } from "./security-tab-loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DepartmentDetailViewProps {
  department: SecurityDepartmentRecord;
  onBack: () => void;
  canManage: boolean;
  onPersonnelChange?: () => void;
}

export function DepartmentDetailView({
  department,
  onBack,
  canManage,
  onPersonnelChange,
}: DepartmentDetailViewProps) {
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

  const departmentRolesMap = useMemo(() => {
    if (!detail) return {};

    return {
      [detail.department]: {
        departmentId: detail._id,
        roles: detail.roles
          .map((entry) => entry.roleName)
          .filter((name): name is string => Boolean(name)),
      },
    };
  }, [detail]);

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
            All departments
          </Button>
        </div>

        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pt-2">
          <CardTitle>{department.department}</CardTitle>
          {canManage && !isLoading && detail && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create personnel
            </Button>
          )}
        </CardHeader>

        <div className="px-6 pb-6">
          {isLoading || !detail ? (
            <SecurityTabLoading />
          ) : (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>App access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.personnel.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No personnel in this department yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detail.personnel.map((person) => (
                      <TableRow key={person._id}>
                        <TableCell className="font-medium">
                          {person.fullName}
                        </TableCell>
                        <TableCell>{person.email}</TableCell>
                        <TableCell>{person.role}</TableCell>
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
          )}
        </div>
      </div>

      {detail && (
        <CreatePersonnelDialog
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            handlePersonnelChange();
          }}
          departmentRoles={departmentRolesMap}
          rolePickerLabel={`${department.department} Roles`}
          rolesOnly
        />
      )}
    </>
  );
}
