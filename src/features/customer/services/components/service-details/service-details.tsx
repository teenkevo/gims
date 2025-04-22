"use client";

import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  ALL_SAMPLE_CLASSES_QUERYResult,
  ALL_STANDARDS_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
  SERVICE_BY_ID_QUERYResult,
} from "../../../../../../sanity.types";
import DataTable from "./service-test-methods-table/data-table";
import { DataTableRowActions } from "../services-table/data-table-row-actions";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { CheckCircledIcon } from "@radix-ui/react-icons";

export default function ServiceDetails({
  service,
  standards,
  sampleClasses,
  testMethods,
}: {
  service: SERVICE_BY_ID_QUERYResult[number];
  standards: ALL_STANDARDS_QUERYResult;
  sampleClasses: ALL_SAMPLE_CLASSES_QUERYResult;
  testMethods: ALL_TEST_METHODS_QUERYResult;
}) {
  const { _id, code, testParameter, status } = service;

  return (
    <>
      <Link
        className="mb-10 inline-flex tracking-tight underline underline-offset-4"
        href="/services"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back to services
      </Link>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-muted-foreground my-1">Service</p>
            <Badge variant="outline">{code}</Badge>
            <div className="flex w-[100px] items-center">
              {service.status === "active" && (
                <Badge variant="outline">
                  <CheckCircledIcon className="mr-2 h-4 w-4 text-primary" />
                  Active
                </Badge>
              )}
              {service.status === "inactive" && (
                <Badge variant="outline">
                  <CrossCircledIcon className="mr-2 h-4 w-4 text-orange-500" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-6">
            {testParameter}
          </h1>
        </div>

        <div className="flex space-x-2">
          <DataTableRowActions
            sampleClasses={sampleClasses}
            testMethods={testMethods}
            service={service}
          />
        </div>
      </div>
      <DataTable
        testMethods={service.testMethods as ALL_TEST_METHODS_QUERYResult}
        standards={standards || []}
        service={service}
      />
    </>
  );
}
