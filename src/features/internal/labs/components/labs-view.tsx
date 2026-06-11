"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircleIcon } from "lucide-react";
import { toast } from "sonner";

import type { ALL_LABS_QUERY_RESULT } from "../../../../../sanity.types";
import { Button } from "@/components/ui/button";
import { DataTable } from "./labs-table/data-table";
import NoLabsPlaceholder from "./no-labs-placeholder";

export function LabsView({
  labs,
  showRegisteredToast = false,
}: {
  labs: ALL_LABS_QUERY_RESULT;
  showRegisteredToast?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!showRegisteredToast) return;

    toast.success("Laboratory registered successfully");
    router.replace("/labs");
  }, [showRegisteredToast, router]);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Laboratories</h1>
      {labs.length > 0 && (
        <div className="flex items-center justify-between">
          <Button asChild className="sm:w-auto" variant="default">
            <Link href="/labs/create" className="my-2 flex items-center">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              <span>Register Laboratory</span>
            </Link>
          </Button>
        </div>
      )}

      {labs.length > 0 ? (
        <div className="mt-5">
          <DataTable data={labs} />
        </div>
      ) : (
        <div className="mt-5">
          <NoLabsPlaceholder helperText="laboratories" needAction />
        </div>
      )}
    </div>
  );
}
