"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../sanity.types";
import type { DepartmentPersonnelRow } from "@/sanity/lib/departments/getDepartmentDetail";
import type { SecurityDepartmentRolesMap } from "@/lib/auth/security-tab-actions";
import { fetchPersonnelById } from "@/lib/auth/security-tab-actions";
import { EditPersonnelDialog } from "@/features/internal/personnel/components/edit-personnel-dialog";
import { DeletePersonnel } from "@/features/internal/personnel/components/row-actions/delete-personnel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DepartmentPersonnelRowActionsProps {
  person: DepartmentPersonnelRow;
  departmentRoles: SecurityDepartmentRolesMap;
  departmentName: string;
  departmentId: string;
  lockedRole: string;
  onPersonnelChange?: () => void;
}

export function DepartmentPersonnelRowActions({
  person,
  departmentRoles,
  departmentName,
  departmentId,
  lockedRole,
  onPersonnelChange,
}: DepartmentPersonnelRowActionsProps) {
  const [openDialog, setOpenDialog] = useState<"edit" | "delete" | null>(null);
  const [personnel, setPersonnel] = useState<
    ALL_PERSONNEL_QUERY_RESULT[number] | null
  >(null);
  const [isLoadingPersonnel, setIsLoadingPersonnel] = useState(false);

  const handleOpenEdit = async () => {
    setIsLoadingPersonnel(true);
    try {
      const data = await fetchPersonnelById(person._id);
      if (!data) {
        toast.error("Failed to load personnel");
        return;
      }
      setPersonnel(data);
      setOpenDialog("edit");
    } catch {
      toast.error("Failed to load personnel");
    } finally {
      setIsLoadingPersonnel(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleSuccess = () => {
    onPersonnelChange?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 data-[state=open]:bg-muted"
            disabled={isLoadingPersonnel}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleOpenEdit}
            disabled={isLoadingPersonnel}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {personnel && (
        <EditPersonnelDialog
          departmentRoles={departmentRoles}
          personnel={personnel}
          open={openDialog === "edit"}
          onClose={handleCloseDialog}
          onSuccess={handleSuccess}
          lockedDepartmentRole={{
            departmentName,
            departmentId,
            role: lockedRole,
          }}
        />
      )}

      <DeletePersonnel
        id={person._id}
        open={openDialog === "delete"}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </>
  );
}
