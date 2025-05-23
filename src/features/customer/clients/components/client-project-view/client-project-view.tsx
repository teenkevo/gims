"use client";

import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { BillingLifecycle } from "@/features/internal/billing/components/billing-lifecycle";
import QuotationFile from "@/features/internal/billing/components/quotation-file";
import { ALL_SERVICES_QUERYResult } from "../../../../../../sanity.types";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../../sanity.types";
import { useParams } from "next/navigation";
import ProjectHeader from "./project-header";
import { useQuotation } from "@/features/internal/billing/components/useQuotation";
import { useRBAC } from "@/components/rbac-context";

export default function ClientProjectView({
  project,
  allServices,
}: {
  project: PROJECT_BY_ID_QUERYResult[number];
  allServices: ALL_SERVICES_QUERYResult;
}) {
  const { clientId } = useParams();

  const { name, startDate, endDate, internalId, clients } = project;

  const client = clients?.find((client) => client._id === clientId);

  // ---------------------------------------------
  // 🔑  Derive stage indices **once** per render
  // ---------------------------------------------
  const statusStageMap: Record<
    "draft" | "sent" | "accepted" | "rejected" | "invoiced" | "paid",
    number
  > = {
    draft: 1,
    sent: 2,
    accepted: 3,
    rejected: 3,
    invoiced: 4,
    paid: 5,
  };

  const { role } = useRBAC();

  const { quotation } = useQuotation(project, role);

  const status = quotation?.status ?? "draft";
  const currentStage = statusStageMap[status] ?? 1;
  const rejectionStage = status === "rejected" ? currentStage : undefined;

  // billing services table states
  const [selectedLabTests, setSelectedLabTests] =
    useState<ALL_SERVICES_QUERYResult>([]);
  const [selectedFieldTests, setSelectedFieldTests] =
    useState<ALL_SERVICES_QUERYResult>([]);
  const [mobilizationActivities, setMobilizationActivities] = useState<
    { activity: string; price: number; quantity: number }[]
  >([]);
  const [reportingActivities, setReportingActivities] = useState<
    { activity: string; price: number; quantity: number }[]
  >([]);

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href={`/clients/${clientId}?tab=projects&client=${client?.name}`}
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>
      <div className="space-y-2">
        <ProjectHeader
          clientName={client?.name || ""}
          projectName={name || ""}
          startDate={startDate ? new Date(startDate) : undefined}
          endDate={endDate ? new Date(endDate) : undefined}
          internalId={internalId || ""}
        />
      </div>

      <div className="space-y-8 my-10">
        <BillingLifecycle
          rejectionStage={rejectionStage}
          currentStage={currentStage}
          allServices={allServices}
          project={project}
          selectedLabTests={selectedLabTests}
          setSelectedLabTests={setSelectedLabTests}
          selectedFieldTests={selectedFieldTests}
          setSelectedFieldTests={setSelectedFieldTests}
          mobilizationActivities={mobilizationActivities}
          setMobilizationActivities={setMobilizationActivities}
          reportingActivities={reportingActivities}
          setReportingActivities={setReportingActivities}
        />
        {quotation && <QuotationFile project={project} />}
      </div>
    </>
  );
}
