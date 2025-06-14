"use client";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ALL_PERSONNEL_QUERYResult } from "../../../../../../sanity.types";
import { useState } from "react";
import { CreatePersonnelDialog } from "../create-personnel-dialog";
import { DeletePersonnel } from "./delete-personnel";
import { Delete, Pencil } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  personnel?: ALL_PERSONNEL_QUERYResult[number];
  departmentRoles: Record<
    string,
    { roles: (string | undefined)[]; departmentId: string }
  >;
}

export function DataTableRowActions<TData>({
  personnel,
  departmentRoles,
}: DataTableRowActionsProps<TData>) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleOpenDialog = (dialogId: string) => {
    setOpenDialog(dialogId);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog1")}
          >
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit Personnel</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog2")}
          >
            {service?.status === "active" ? (
              <CrossCircledIcon className=" h-4 w-4 mr-2" />
            ) : (
              <CheckCircledIcon className=" h-4 w-4 mr-2" />
            )}
            <span>
              {service?.status === "active" ? "Deactivate" : "Activate"}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem
            className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog3")}
          >
            <Delete className="h-4 w-4 mr-2 text-destructive" />
            <span>Delete Personnel</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreatePersonnelDialog
        departmentRoles={departmentRoles}
        isEdit={true}
        personnel={personnel}
        open={openDialog === "dialog1"}
        onClose={handleCloseDialog}
      />
      <DeletePersonnel
        id={personnel?._id || ""}
        open={openDialog === "dialog3"}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
