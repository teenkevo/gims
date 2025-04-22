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
  ALL_STANDARDS_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
} from "../../../../../../../sanity.types";

import { Delete, Pencil, Trash } from "lucide-react";
import { DeleteTestMethod } from "./row-actions/delete-test-method";
import { getDocumentsReferencingTestMethod } from "@/lib/actions";

interface DataTableRowActionsProps<TData> {
  standards: ALL_STANDARDS_QUERYResult;
  testMethod: ALL_TEST_METHODS_QUERYResult[number];
  redirect?: boolean;
}

export function DataTableRowActions<TData>({
  standards,
  testMethod,
  redirect,
}: DataTableRowActionsProps<TData>) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const [referencingDocs, setReferencingDocs] = useState([]);

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
            onClick={async () => {
              const docs = await getDocumentsReferencingTestMethod(
                testMethod._id
              );
              setReferencingDocs(docs);
              handleOpenDialog("dialog2");
            }}
          >
            <Delete className="h-4 w-4 mr-2 text-destructive" />
            <span>Delete Test Method</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditTestMethodDialog
        standards={standards}
        testMethod={testMethod}
        open={openDialog === "dialog1"}
        onClose={handleCloseDialog}
      />
      <DeleteTestMethod
        testMethod={testMethod}
        open={openDialog === "dialog2"}
        onClose={handleCloseDialog}
        referencingDocs={referencingDocs}
        redirect={true}
      />
    </div>
  );
}
