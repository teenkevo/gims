import * as React from "react";

import { getAllSampleClasses } from "@/sanity/lib/services/getAllSampleClasses";
import { getAllTestMethods } from "@/sanity/lib/services/getAllTestMethods";
import Link from "next/link";
import {
  ArrowLeftCircle,
  Book,
  PlusCircleIcon,
  FlaskRoundIcon as Flask,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SummaryCard from "../summary-card";
import { CreateSampleClassDialog } from "../create-sample-class";
import { DataTable } from "./sample-classes.table/data-table";
import { getAllServices } from "@/sanity/lib/services/getAllServices";
export async function SampleClasses() {
  // Fetch data in parallel
  const [sampleClasses, services] = await Promise.all([
    getAllSampleClasses(),
    getAllServices(),
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
          icon={<Flask className="h-12 w-12 text-muted-foreground/60" />}
          title="Sample Classes"
          description="Material categories for testing"
          footer={
            <CreateSampleClassDialog
              trigger={
                <Button>
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Add new sample class
                </Button>
              }
            />
          }
        />
      </div>
      <DataTable data={sampleClasses} services={services} />
    </main>
  );
}
