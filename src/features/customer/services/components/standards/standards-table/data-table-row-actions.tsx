"use client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ALL_STANDARDS_QUERYResult } from "../../../../../../../sanity.types";
import { useState } from "react";
import { EditStandardDialog } from "./row-actions/edit-standard";
import { DeleteStandard } from "./row-actions/delete-standard";
import { Delete, Pencil, Trash } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  standard: ALL_STANDARDS_QUERYResult[number];
}

export function DataTableRowActions<TData>({
  standard,
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
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog1")}
          >
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit Standard</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog2")}
          >
            <Delete className="h-4 w-4 mr-2 text-destructive" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditStandardDialog
        standard={standard}
        open={openDialog === "dialog1"}
        onClose={handleCloseDialog}
      />
      <DeleteStandard
        id={standard._id}
        open={openDialog === "dialog2"}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
