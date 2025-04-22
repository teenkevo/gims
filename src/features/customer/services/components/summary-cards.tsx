"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Beaker,
  Book,
  FlaskRoundIcon as Flask,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateStandardDialog } from "./create-standard";
import { getAllStandards } from "@/sanity/lib/services/getAllStandards";
import { ALL_STANDARDS_QUERYResult } from "../../../../../sanity.types";
import { CreateTestMethodDialog } from "./create-test-method";
import { CreateSampleClassDialog } from "./create-sample-class";
import Link from "next/link";

export default function SummaryCards({
  standards,
}: {
  standards: ALL_STANDARDS_QUERYResult;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {/* Standards Card */}
      <div className="bg-gradient-to-b from-muted/20 to-muted/40 rounded-xl border">
        <CardHeader className="flex flex-row gap-4 rounded-t-xl bg-gradient-to-b from-black/90 to-black/80 dark:from-white dark:to-zinc-300 py-2">
          <Book className="h-12 w-12 text-muted-foreground/60" />
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-md font-semibold text-white dark:text-black leading-tight">
                Standards
              </h2>
              {/* <Badge variant="outline" className="text-background">
                {data.standards.length}
              </Badge> */}
            </div>
            <CardDescription className="mt-1 text-muted">
              Testing standards used in the lab
            </CardDescription>
          </div>
        </CardHeader>

        <CardFooter className="p-4 pt-4 border-t flex justify-between">
          <Button variant="ghost" className="text-sm flex items-center">
            <Link className="flex items-center" href="/services/standards">
              <FileText className="h-4 w-4 mr-2" />
              View all
            </Link>
          </Button>
          <CreateStandardDialog />
        </CardFooter>
      </div>

      {/* Test Methods Card */}
      <div className="bg-gradient-to-b from-muted/20 to-muted/40 rounded-xl border">
        <CardHeader className="flex flex-row gap-4 rounded-t-xl bg-gradient-to-b from-black/90 to-black/80 dark:from-white dark:to-zinc-300 py-2">
          <Beaker className="h-12 w-12 text-muted-foreground/60" />
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-md font-semibold text-white dark:text-black leading-tight">
                Test Methods
              </h2>
              {/* <Badge variant="outline" className="text-background">
                {data.standards.length}
              </Badge> */}
            </div>
            <CardDescription className="mt-1 text-muted">
              Available testing methods
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-4 border-t flex justify-between">
          <Button variant="ghost" className="text-sm flex items-center">
            <Link className="flex items-center" href="/services/test-methods">
              <FileText className="h-4 w-4 mr-2" />
              View all
            </Link>
          </Button>
          <CreateTestMethodDialog standards={standards} />
        </CardFooter>
      </div>

      {/* Sample Classes Card */}
      <div className="bg-gradient-to-b from-muted/20 to-muted/40 rounded-xl border">
        <CardHeader className="flex flex-row gap-4 rounded-t-xl bg-gradient-to-b from-black/90 to-black/80 dark:from-white dark:to-zinc-300 py-2">
          <Flask className="h-12 w-12 text-muted-foreground/60" />
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-md font-semibold text-white dark:text-black leading-tight">
                Sample Classes
              </h2>
              {/* <Badge variant="outline" className="text-background">
                {data.standards.length}
              </Badge> */}
            </div>
            <CardDescription className="mt-1 text-muted">
              Material categories for testing
            </CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-4 border-t flex justify-between">
          <Button variant="ghost" className="text-sm flex items-center">
            <Link className="flex items-center" href="/services/sample-classes">
              <FileText className="h-4 w-4 mr-2" />
              View all
            </Link>
          </Button>
          <CreateSampleClassDialog />
        </CardFooter>
      </div>
    </div>
  );
}
