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

import { useState } from "react";
import { EditTestMethodDialog } from "./row-actions/edit-test-method";
import {
  ALL_SERVICES_QUERYResult,
  ALL_STANDARDS_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
} from "../../../../../../../sanity.types";
import { DeleteTestMethod } from "./row-actions/delete-test-method";
import { Pencil, Trash } from "lucide-react";

interface DataTableRowActionsProps<TData> {
  standards: ALL_STANDARDS_QUERYResult;
  testMethod: ALL_TEST_METHODS_QUERYResult[number];
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  standards,
  testMethod,
  row,
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
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog1")}
          >
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit Test Method</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            onClick={() => handleOpenDialog("dialog2")}
          >
            <Trash className="h-4 w-4 mr-2 text-destructive" />
            <span>Delete Test Method</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditTestMethodDialog
        standards={standards}
        testMethod={row.original as ALL_TEST_METHODS_QUERYResult[number]}
        open={openDialog === "dialog1"}
        onClose={handleCloseDialog}
      />
      <DeleteTestMethod
        id={testMethod._id}
        open={openDialog === "dialog2"}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
