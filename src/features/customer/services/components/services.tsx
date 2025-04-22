import * as React from "react";

import { getColumns } from "./services-table/columns";
import { DataTable } from "./services-table/data-table";
import SummaryCards from "./summary-cards";
import { getAllStandards } from "@/sanity/lib/services/getAllStandards";
import { getAllTestMethods } from "@/sanity/lib/services/getAllTestMethods";
import { getAllSampleClasses } from "@/sanity/lib/services/getAllSampleClasses";
import { CreateServiceDialog } from "./create-service";
import { getAllServices } from "@/sanity/lib/services/getAllServices";

export async function Services() {
  const services = await getAllServices();
  const standards = await getAllStandards();
  const sampleClasses = await getAllSampleClasses();
  const testMethods = await getAllTestMethods();

  return (
    <main className="gap-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Services</h1>
      <SummaryCards standards={standards} />
      <CreateServiceDialog
        standards={standards}
        sampleClasses={sampleClasses}
        testMethods={testMethods}
      />
      <DataTable
        data={services}
        standards={standards}
        sampleClasses={sampleClasses}
        testMethods={testMethods}
      />
    </main>
  );
}
