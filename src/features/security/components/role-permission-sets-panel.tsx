"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { AppRoleRecord } from "@/sanity/lib/auth/getAllAppRoles";
import { updateDepartmentRolePermissionSets } from "@/lib/auth/department-actions";
import { fetchSecurityRoles } from "@/lib/auth/security-tab-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RolePermissionSetsPanelProps {
  departmentId: string;
  roleName: string;
  selectedAppRoleIds: string[];
  canManage: boolean;
  onSuccess?: () => void;
}

export function RolePermissionSetsPanel({
  departmentId,
  roleName,
  selectedAppRoleIds,
  canManage,
  onSuccess,
}: RolePermissionSetsPanelProps) {
  const [appRoles, setAppRoles] = useState<AppRoleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [dialogSelectedIds, setDialogSelectedIds] = useState<Set<string>>(
    new Set()
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsLoading(true);
    fetchSecurityRoles()
      .then(setAppRoles)
      .catch(() => toast.error("Failed to load permission sets"))
      .finally(() => setIsLoading(false));
  }, []);

  const assignedPermissionSets = useMemo(
    () => appRoles.filter((role) => selectedAppRoleIds.includes(role._id)),
    [appRoles, selectedAppRoleIds]
  );

  const openAddDialog = () => {
    setDialogSelectedIds(new Set(selectedAppRoleIds));
    setAddOpen(true);
  };

  const toggleDialogSelection = (appRoleId: string, checked: boolean) => {
    setDialogSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(appRoleId);
      } else {
        next.delete(appRoleId);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (dialogSelectedIds.size === 0) {
      toast.error("Select at least one permission set");
      return;
    }

    startTransition(async () => {
      try {
        await updateDepartmentRolePermissionSets(
          departmentId,
          roleName,
          Array.from(dialogSelectedIds)
        );
        toast.success("Permission sets updated");
        setAddOpen(false);
        onSuccess?.();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update permission sets"
        );
      }
    });
  };

  if (isLoading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Loading permission sets...
      </p>
    );
  }

  return (
    <>
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add permission set
          </Button>
        </div>
      )}

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission set</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedPermissionSets.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground">
                  No permission sets assigned to this role yet.
                </TableCell>
              </TableRow>
            ) : (
              assignedPermissionSets.map((role) => (
                <TableRow key={role._id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add permission sets</DialogTitle>
          </DialogHeader>

          <div className="max-h-72 space-y-3 overflow-y-auto py-1">
            {appRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No permission sets available.
              </p>
            ) : (
              appRoles.map((appRole) => (
                <div key={appRole._id} className="flex items-center gap-3">
                  <Checkbox
                    id={`add-permission-set-${appRole._id}`}
                    checked={dialogSelectedIds.has(appRole._id)}
                    onCheckedChange={(value) =>
                      toggleDialogSelection(appRole._id, value === true)
                    }
                    disabled={isPending}
                  />
                  <Label
                    htmlFor={`add-permission-set-${appRole._id}`}
                    className="cursor-pointer font-normal"
                  >
                    {appRole.name}
                  </Label>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || dialogSelectedIds.size === 0}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
