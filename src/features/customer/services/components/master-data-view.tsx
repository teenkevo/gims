import * as React from "react";

import SummaryCards from "./summary-cards";
import { getAllStandards } from "@/sanity/lib/services/getAllStandards";

export async function MasterDataView() {
  const standards = await getAllStandards();

  return (
    <main className="gap-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Master Data</h1>
      <p className="text-muted-foreground mb-6">
        Configure standards, test methods, and sample classes used across
        laboratory services.
      </p>
      <SummaryCards standards={standards} />
    </main>
  );
}
