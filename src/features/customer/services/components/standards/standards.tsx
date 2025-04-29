import * as React from "react";

import { getAllStandards } from "@/sanity/lib/services/getAllStandards";
import { getAllTestMethods } from "@/sanity/lib/services/getAllTestMethods";
import Link from "next/link";
import { ArrowLeftCircle, Book, PlusCircleIcon } from "lucide-react";
import { CreateStandardDialog } from "../create-standard";
import { Button } from "@/components/ui/button";
import { DataTable } from "./standards-table/data-table";
import SummaryCard from "../summary-card";

export async function Standards() {
  // Fetch data in parallel
  const [standards, testMethods] = await Promise.all([
    getAllStandards(),
    getAllTestMethods(),
  ]);

  return (
    <main className="gap-4">
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/services"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back to services
      </Link>
      <div className="mb-10">
        <SummaryCard
          icon={<Book className="h-12 w-12 text-muted-foreground/60" />}
          title="Standards"
          description="Testing standards used in the lab"
          footer={
            <CreateStandardDialog
              trigger={
                <Button>
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Add new standard
                </Button>
              }
            />
          }
        />
      </div>
      <DataTable data={standards} testMethods={testMethods} />
    </main>
  );
}
