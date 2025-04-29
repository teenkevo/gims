"use client";

import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  ALL_STANDARDS_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
} from "../../../../../../sanity.types";
import { STANDARD_BY_ID_QUERYResult } from "../../../../../../sanity.types";
import { Badge } from "@/components/ui/badge";
import { DeleteStandard } from "./standards-table/row-actions/delete-standard";
import { EditStandardDialog } from "./standards-table/row-actions/edit-standard";
import DataTable from "./test-methods-table/data-table";
import { DataTableRowActions } from "./standards-table/data-table-row-actions";

export default function StandardDetails({
  standard,
  existingTestMethods,
  standards,
}: {
  standard: STANDARD_BY_ID_QUERYResult[number];
  existingTestMethods: ALL_TEST_METHODS_QUERYResult;
  standards: ALL_STANDARDS_QUERYResult;
}) {
  const { _id, name, acronym, description } = standard;

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/services/standards"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back to standards
      </Link>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground my-1">Standard</p>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-6">
            {name} ({acronym})
          </h1>
        </div>
        <div className="flex space-x-2">
          <DataTableRowActions standard={standard} />
        </div>
      </div>

      <Badge variant="outline">{acronym} Test Methods</Badge>

      <DataTable
        testMethods={existingTestMethods}
        standardId={_id}
        standards={standards}
      />
    </>
  );
}
