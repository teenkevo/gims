"use client";

import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";

import type { ALL_EQUIPMENT_QUERY_RESULT } from "../../../../../sanity.types";
import { Button } from "@/components/ui/button";
import { DataTable } from "./equipment-table/data-table";
import NoEquipmentPlaceholder from "./no-equipment-placeholder";

export function EquipmentView({
  equipment,
}: {
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
}) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Equipment</h1>
      {equipment.length > 0 && (
        <div className="flex items-center justify-between">
          <Button asChild className="sm:w-auto" variant="default">
            <Link href="/equipment/create" className="my-2 flex items-center">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              <span>Register Equipment</span>
            </Link>
          </Button>
        </div>
      )}

      {equipment.length > 0 ? (
        <div className="mt-5">
          <DataTable data={equipment} />
        </div>
      ) : (
        <div className="mt-5">
          <NoEquipmentPlaceholder needAction />
        </div>
      )}
    </div>
  );
}
