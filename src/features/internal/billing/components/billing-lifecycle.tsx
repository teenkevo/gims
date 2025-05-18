// ===========================
// File: billing-lifecycle.tsx
// ===========================
import type React from "react";

import { useState, useEffect, Dispatch, SetStateAction, useRef } from "react";
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  FileIcon as FileInvoice,
  DollarSign,
  Plus,
  CircleDashed,
  ReceiptText,
  FileIcon,
  ExternalLink,
  GitPullRequest,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../sanity.types";
import { QuotationDrawer } from "./quotation-drawer";
import { SendQuotationDialog } from "./send-quotation-dialog";
import { useRBAC } from "@/components/rbac-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RespondToQuotationDialog } from "./respond-to-quotation";
import { useQuotation } from "./useQuotation";

type Stage = {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
};

interface BillingLifecycleProps {
  currentStage?: number;
  rejectionStage?: number;
  allServices: ALL_SERVICES_QUERYResult;
  project: PROJECT_BY_ID_QUERYResult[number];
  selectedLabTests: ALL_SERVICES_QUERYResult;
  setSelectedLabTests: Dispatch<SetStateAction<ALL_SERVICES_QUERYResult>>;
  selectedFieldTests: ALL_SERVICES_QUERYResult;
  setSelectedFieldTests: Dispatch<SetStateAction<ALL_SERVICES_QUERYResult>>;
  mobilizationActivities: {
    activity: string;
    price: number;
    quantity: number;
  }[];
  setMobilizationActivities: Dispatch<
    SetStateAction<{ activity: string; price: number; quantity: number }[]>
  >;
  reportingActivities: { activity: string; price: number; quantity: number }[];
  setReportingActivities: Dispatch<
    SetStateAction<{ activity: string; price: number; quantity: number }[]>
  >;
}

export function BillingLifecycle({
  currentStage = 1,
  rejectionStage,
  allServices,
  project,
  selectedLabTests,
  setSelectedLabTests,
  selectedFieldTests,
  setSelectedFieldTests,
  mobilizationActivities,
  setMobilizationActivities,
  reportingActivities,
  setReportingActivities,
}: BillingLifecycleProps) {
  const [progress, setProgress] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { role } = useRBAC();

  const {
    isClientWaitingForParentQuotation,
    isAdminWaitingToCreateQuotation,
    isParentQuotationCreated,
    quotation,
    quotationNeedsRevision,
  } = useQuotation(project, role);

  // Define stage configurations
  // TODO: Work on roles here
  const stages: Stage[] = [
    {
      id: 1,
      title: isClientWaitingForParentQuotation
        ? "Waiting for Quotation"
        : isAdminWaitingToCreateQuotation
          ? "Create Quotation"
          : "Quotation Created",
      icon: isParentQuotationCreated ? (
        <FileText className="h-3 w-3" />
      ) : (
        <Plus className="h-3 w-3" />
      ),
      description: isClientWaitingForParentQuotation
        ? "Waiting for quotation to be created by GETLAB"
        : isAdminWaitingToCreateQuotation
          ? "A quotation is needed to initiate the billing pipeline"
          : "A quotation has been created by GETLAB",
    },
    {
      id: 2,
      title: "Sent to Client",
      icon: <Send className="h-3 w-3" />,
      description: "Quotation has been sent to the client for review",
    },
    {
      id: 3,
      title: "Client Response",
      icon:
        rejectionStage === 3 ? (
          <XCircle className="h-3 w-3" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        ),
      description:
        rejectionStage === 3 && !quotationNeedsRevision
          ? "Quotation was rejected by the client"
          : rejectionStage === 3 && quotationNeedsRevision
            ? "Quotation was rejected by the client with revisions requested"
            : "Revisions are possible at this stage if needed",
    },
    {
      id: 4,
      title: "Invoice Issued",
      icon: <FileIcon className="h-3 w-3" />,
      description: "Invoice has been issued based on the accepted quotation",
    },
    {
      id: 5,
      title: "Payment Received",
      icon: <DollarSign className="h-3 w-3" />,
      description: "Payment has been received for the invoice",
    },
  ];

  // -----------------------------
  // Progress bar & focus logic
  // -----------------------------
  useEffect(() => {
    // Reset previous timers on every run
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Restart animation cycle
    setAnimationComplete(false);

    const isRejected = typeof rejectionStage === "number";
    const effectiveStage = isRejected ? rejectionStage : currentStage;

    const target = ((effectiveStage - 1) / (stages.length - 1)) * 100;

    if (isRejected) {
      setProgress(target);
      // Only one timer to mark animation done
      timers.current.push(setTimeout(() => setAnimationComplete(true), 1000));
      return;
    }

    // Normal flow: start from 0 then animate to target
    setProgress(0);

    timers.current.push(
      setTimeout(() => {
        setProgress(target);
        timers.current.push(setTimeout(() => setAnimationComplete(true), 1000));
      }, 300)
    );
  }, [currentStage, rejectionStage, stages.length]);

  return (
    <div className="w-full">
      {/* Horizontal progress bar (md screens and up) */}
      <div className="hidden xl:block">
        <div className="relative h-1 bg-gray-200 rounded-full mb-10 mt-6 flex items-center">
          <div
            className="absolute h-1 bg-primary rounded-full transition-all duration-1000 ease-in-out top-0 left-0"
            style={{ width: `${progress}%` }}
          />

          {/* Stage markers (horizontal) */}
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={cn(
                "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
                "transition-all duration-500 ease-in-out"
              )}
              style={{
                left: `${((stage.id - 1) / (stages.length - 1)) * 100}%`,
              }}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  "transition-all duration-500 ease-in-out",
                  stage.id < currentStage && !rejectionStage
                    ? "bg-primary text-primary-foreground"
                    : stage.id === currentStage && !rejectionStage
                      ? "bg-primary text-white"
                      : rejectionStage && stage.id <= rejectionStage
                        ? stage.id === rejectionStage && !quotationNeedsRevision
                          ? "bg-destructive text-destructive-foreground"
                          : stage.id === rejectionStage &&
                              quotationNeedsRevision
                            ? "bg-orange-500 border border-orange-500"
                            : "bg-primary text-primary-foreground"
                        : "bg-gray-200 text-gray-400",
                  stage.id === currentStage &&
                    animationComplete &&
                    !rejectionStage
                    ? "ring-4 ring-emerald-100"
                    : stage.id === rejectionStage && animationComplete
                      ? "ring-4 ring-red-100"
                      : ""
                )}
              >
                <span className="text-xs font-bold">{stage.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stage details for md+ screens */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={cn(
                "bg-gradient-to-b from-muted/20 to-muted/40 p-4 rounded-lg transition-all duration-500",
                stage.id === currentStage && !rejectionStage
                  ? "border border-primary bg-primary/10"
                  : stage.id === rejectionStage && !quotationNeedsRevision
                    ? "bg-destructive/10 border border-destructive"
                    : stage.id === 3 && quotationNeedsRevision
                      ? "bg-orange-500/10 border border-orange-500"
                      : stage.id < currentStage && !rejectionStage
                        ? "border border-muted-foreground" // Add border-primary to completed stages
                        : "bg-gradient-to-b from-muted/20 to-muted/40 border"
              )}
            >
              <div className="flex items-center mb-2">
                <div
                  className={cn(
                    "p-2 rounded-full mr-2",
                    stage.id === currentStage && !rejectionStage
                      ? "bg-primary/10"
                      : stage.id === rejectionStage && !quotationNeedsRevision
                        ? "bg-destructive/10"
                        : stage.id === 3 && quotationNeedsRevision
                          ? "bg-orange-500/10"
                          : stage.id < currentStage && !rejectionStage
                            ? "bg-primary/10" // Add primary background to completed stages
                            : "bg-muted-foreground/10"
                  )}
                >
                  {stage.icon}
                </div>
                <h3 className="font-semibold text-sm">{stage.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {stage.description}
              </p>
              {/* ALL FINISHED STAGES AFTER QUOTATION IS SENT */}
              {stage.id < currentStage && (
                <div className="mt-4 flex items-center text-primary text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Completed</span>
                </div>
              )}
              {/* STAGE 1 */}
              {!quotation && stage.id === 1 && (
                <div className="mt-4 flex items-center text-orange-600 text-xs">
                  <CircleDashed className="h-3 w-3 mr-1" />
                  <span>Pending</span>
                </div>
              )}
              {quotation && stage.id === 1 && quotation.status === "draft" && (
                <div className="mt-4 flex items-center text-orange-600 text-xs">
                  <ReceiptText className="h-3 w-3 mr-1" />
                  <span>
                    {role === "client"
                      ? "Waiting for GETLAB to send"
                      : "Draft created but not sent"}
                  </span>
                </div>
              )}
              {stage.id === 1 && currentStage === 1 && role !== "client" && (
                <div className="mt-5 flex flex-wrap gap-2 items-center">
                  <QuotationDrawer
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
                  {quotation && <SendQuotationDialog project={project} />}
                </div>
              )}
              {/* STAGE 2 */}
              {/* TODO: Might need to restrict this to Client only */}
              {quotation && quotation.status === "sent" && stage.id === 2 && (
                <div className="mt-5 flex flex-wrap gap-2 items-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border border-primary/30"
                  >
                    <Link
                      className="flex items-center"
                      href={quotation?.file?.asset?.url || ""}
                      target="_blank"
                    >
                      <ExternalLink className="text-primary h-4 w-4 mr-2" />
                      View Quotation
                    </Link>
                  </Button>
                </div>
              )}
              {/* STAGE 3 */}
              {quotation && stage.id === 3 && quotation.status === "sent" && (
                <div className="mt-4 flex items-center text-orange-500 text-xs">
                  <CircleDashed className="animate-spin h-3 w-3 mr-1" />
                  <span>Awaiting client response</span>
                </div>
              )}
              {quotation &&
                stage.id === 3 &&
                quotation.status === "sent" &&
                role === "client" && (
                  <div className="mt-4 flex items-center text-orange-500 text-xs">
                    <RespondToQuotationDialog project={project} />
                  </div>
                )}
              {stage.id === rejectionStage && !quotationNeedsRevision && (
                <div className="mt-4 flex items-center text-destructive text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  <span>Process stopped</span>
                </div>
              )}
              {quotation && stage.id === 3 && quotationNeedsRevision && (
                <div className="mt-4 flex items-center text-orange-500 text-xs">
                  <GitPullRequest className="h-3 w-3 mr-1" />
                  <span>Revisions requested</span>
                </div>
              )}
              {/* STAGE 3 */}
              {quotation &&
                stage.id === 3 &&
                quotationNeedsRevision &&
                role === "client" && (
                  <div className="mt-2 flex items-center text-orange-500 text-xs">
                    <CircleDashed className="animate-spin h-3 w-3 mr-1" />
                    <span>Awaiting GETLAB's response</span>
                  </div>
                )}
              {quotation &&
                stage.id === 3 &&
                quotationNeedsRevision &&
                role !== "client" && (
                  <div className="mt-4 flex items-center text-orange-500 text-xs">
                    <QuotationDrawer
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
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Vertical progress bar with cards for small screens */}
      <div className="xl:hidden">
        <div className="relative">
          {/* Vertical progress line */}
          <div className="absolute left-3 top-0 bottom-0 w-1 bg-gray-200 rounded-full">
            <div
              className="absolute w-1 bg-primary rounded-full transition-all duration-1000 ease-in-out left-0 top-0"
              style={{ height: `${progress}%` }}
            />
          </div>

          {/* Cards with aligned dots */}
          <div className="space-y-4 pl-10">
            {stages.map((stage) => (
              <div key={stage.id} className="relative">
                {/* Dot marker aligned with card */}
                <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      "transition-all duration-500 ease-in-out",
                      stage.id < currentStage && !rejectionStage
                        ? "bg-primary text-primary-foreground"
                        : stage.id === currentStage && !rejectionStage
                          ? "bg-primary text-white"
                          : rejectionStage && stage.id <= rejectionStage
                            ? stage.id === rejectionStage
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-primary text-primary-foreground"
                            : "bg-gray-200 text-gray-400",
                      stage.id === currentStage &&
                        animationComplete &&
                        !rejectionStage
                        ? "ring-4 ring-emerald-100"
                        : stage.id === rejectionStage && animationComplete
                          ? "ring-4 ring-red-100"
                          : ""
                    )}
                  >
                    <span className="text-xs font-bold">{stage.id}</span>
                  </div>
                </div>

                {/* Card */}
                <div
                  className={cn(
                    "bg-gradient-to-b from-muted/20 to-muted/40 p-4 rounded-lg transition-all duration-500",
                    stage.id === currentStage && !rejectionStage
                      ? "border border-primary"
                      : stage.id === rejectionStage
                        ? "bg-destructive/10 border border-destructive"
                        : stage.id < currentStage && !rejectionStage
                          ? "border border-primary" // Add border-primary to completed stages
                          : "bg-gradient-to-b from-muted/20 to-muted/40 border"
                  )}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className={cn(
                        "p-2 rounded-full mr-2 text-foreground",
                        stage.id === currentStage && !rejectionStage
                          ? "bg-primary/10"
                          : stage.id === rejectionStage
                            ? "bg-destructive/10"
                            : stage.id < currentStage && !rejectionStage
                              ? "bg-primary/10" // Add primary background to completed stages
                              : "bg-muted-foreground/10"
                      )}
                    >
                      {stage.icon}
                    </div>
                    <h3 className="font-semibold text-sm">{stage.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stage.description}
                  </p>

                  {/* ALL FINISHED STAGES AFTER QUOTATION IS SENT */}
                  {stage.id < currentStage && (
                    <div className="mt-4 flex items-center text-primary text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Completed</span>
                    </div>
                  )}
                  {/* STAGE 1 */}
                  {!quotation && stage.id === 1 && (
                    <div className="mt-4 flex items-center text-orange-600 text-xs">
                      <CircleDashed className="h-3 w-3 mr-1" />
                      <span>Pending</span>
                    </div>
                  )}
                  {quotation &&
                    stage.id === 1 &&
                    quotation.status === "draft" && (
                      <div className="mt-4 flex items-center text-orange-600 text-xs">
                        <ReceiptText className="h-3 w-3 mr-1" />
                        <span>
                          {role === "client"
                            ? "Waiting for GETLAB to send"
                            : "Draft created but not sent"}
                        </span>
                      </div>
                    )}
                  {stage.id === 1 &&
                    currentStage === 1 &&
                    role !== "client" && (
                      <div className="mt-5 flex flex-wrap gap-2 items-center">
                        <QuotationDrawer
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
                        {quotation && <SendQuotationDialog project={project} />}
                      </div>
                    )}
                  {/* STAGE 2 */}
                  {/* TODO: Might need to restrict this to Client only */}
                  {quotation &&
                    quotation.status === "sent" &&
                    stage.id === 2 && (
                      <div className="mt-5 flex flex-wrap gap-2 items-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="border border-primary/30"
                        >
                          <Link
                            className="flex items-center"
                            href={quotation?.file?.asset?.url || ""}
                            target="_blank"
                          >
                            <ExternalLink className="text-primary h-4 w-4 mr-2" />
                            View Quotation
                          </Link>
                        </Button>
                      </div>
                    )}
                  {/* STAGE 3 */}
                  {quotation &&
                    stage.id === 3 &&
                    quotation.status === "sent" && (
                      <div className="mt-4 flex items-center text-orange-500 text-xs">
                        <CircleDashed className="animate-spin h-3 w-3 mr-1" />
                        <span>Awaiting client response</span>
                      </div>
                    )}
                  {quotation &&
                    stage.id === 3 &&
                    quotation.status === "sent" &&
                    role === "client" && (
                      <div className="mt-4 flex items-center text-orange-500 text-xs">
                        <RespondToQuotationDialog project={project} />
                      </div>
                    )}
                  {stage.id === rejectionStage && !quotationNeedsRevision && (
                    <div className="mt-4 flex items-center text-destructive text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      <span>Process stopped</span>
                    </div>
                  )}
                  {quotation && stage.id === 3 && quotationNeedsRevision && (
                    <div className="mt-4 flex items-center text-orange-500 text-xs">
                      <GitPullRequest className="h-3 w-3 mr-1" />
                      <span>Revisions requested</span>
                    </div>
                  )}
                  {/* STAGE 3 */}
                  {quotation &&
                    stage.id === 3 &&
                    quotationNeedsRevision &&
                    role === "client" && (
                      <div className="mt-2 flex items-center text-orange-500 text-xs">
                        <CircleDashed className="animate-spin h-3 w-3 mr-1" />
                        <span>Awaiting GETLAB's response</span>
                      </div>
                    )}
                  {quotation &&
                    stage.id === 3 &&
                    quotationNeedsRevision &&
                    role !== "client" && (
                      <div className="mt-4 flex items-center text-orange-500 text-xs">
                        <QuotationDrawer
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
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
