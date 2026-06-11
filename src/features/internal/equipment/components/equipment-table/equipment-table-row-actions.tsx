"use client";

import { useState } from "react";
import Link from "next/link";
import { Delete, MoreVertical, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ALL_EQUIPMENT_QUERY_RESULT } from "../../../../../../sanity.types";
import { DeleteEquipmentDialog } from "./row-actions/delete-equipment-dialog";

export function EquipmentTableRowActions({
  item,
}: {
  item: ALL_EQUIPMENT_QUERY_RESULT[number];
}) {
  const [openDialog, setOpenDialog] = useState<"delete" | null>(null);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem asChild>
            <Link
              href={`/equipment/${item._id}`}
              className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              <Pencil className="h-4 w-4 mr-2" />
              <span>View Equipment</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm font-medium text-destructive focus:text-destructive"
            onClick={() => setOpenDialog("delete")}
          >
            <Delete className="h-4 w-4 mr-2" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteEquipmentDialog
        item={item}
        open={openDialog === "delete"}
        onClose={() => setOpenDialog(null)}
      />
    </div>
  );
}
