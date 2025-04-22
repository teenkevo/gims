import * as React from "react";

import { getAllStandards } from "@/sanity/lib/services/getAllStandards";
import { getAllTestMethods } from "@/sanity/lib/services/getAllTestMethods";
import Link from "next/link";
import { ArrowLeftCircle, Beaker, PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SummaryCard from "../summary-card";
import DataTable from "./test-methods-table/data-table";
import { CreateTestMethodDialog } from "../create-test-method";

export async function TestMethods() {
  // Fetch data in parallel
  const [testMethods, standards] = await Promise.all([
    getAllTestMethods(),
    getAllStandards(),
  ]);

  return (
    <main className="gap-4">
      <Link
        className="mb-10 inline-flex tracking-tight underline underline-offset-4"
        href="/services"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back to services
      </Link>
      <div className="mb-10">
        <SummaryCard
          icon={<Beaker className="h-12 w-12 text-muted-foreground/60" />}
          title="Test Methods"
          description="Availalbe testing methods"
          footer={
            <CreateTestMethodDialog
              standards={standards}
              trigger={
                <Button>
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Add new test method
                </Button>
              }
            />
          }
        />
      </div>
      <DataTable testMethods={testMethods} standards={standards} />
    </main>
  );
}
