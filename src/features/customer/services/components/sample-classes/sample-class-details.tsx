"use client";

import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ALL_SAMPLE_CLASSES_QUERYResult } from "../../../../../../sanity.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// import { DataTableRowActions } from "./test-methods-table/data-table-row-actions";

export default function TestMethodDetails({
  sampleClass,
}: {
  sampleClass: ALL_SAMPLE_CLASSES_QUERYResult[number];
}) {
  const [activeTab, setActiveTab] = useState("description");

  const { _id, description, name, subclasses } = sampleClass;

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/services/test-methods"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back to sample classes
      </Link>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex w-[60px] items-center">
              <Badge variant="outline">{name}</Badge>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-6">{_id}</h1>
        </div>

        <div className="flex space-x-2">
          {/* <DataTableRowActions
            redirect={true}
            testMethod={testMethod}
            standards={standards}
          /> */}
        </div>
      </div>
      {/* Tabs */}
      <Tabs
        defaultValue="description"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList>
          {subclasses?.map((subclass) => (
            <TabsTrigger value={subclass.name?.toLowerCase() || ""}>
              {subclass.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg ">
            <CardHeader>
              <CardTitle className="text-xl">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {description || "No description"}
              </p>
              <div className="flex-wrap mt-6 -mx-6 -mb-6 px-6 py-4 flex rounded-b-xl bg-muted/50 justify-between border-t items-center">
                <h3 className="text-lg font-medium mb-3"></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Standard Designation
                    </p>
                    <p className="font-medium">{name}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="font-medium">{new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6"></TabsContent>
      </Tabs>
    </>
  );
}
