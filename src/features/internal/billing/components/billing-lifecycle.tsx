import type React from "react";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  FileIcon as FileInvoice,
  DollarSign,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../sanity.types";
import { QuotationReviewDrawer } from "./quotation-review-drawer";
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

  const stages: Stage[] = [
    {
      id: 1,
      title: "Quotation Created",
      icon: <FileText className="h-6 w-6" />,
      description: "Initial quotation has been created in the system",
    },
    {
      id: 2,
      title: "Sent to Client",
      icon: <Send className="h-6 w-6" />,
      description: "Quotation has been sent to the client for review",
    },
    {
      id: 3,
      title: "Client Response",
      icon:
        rejectionStage === 3 ? (
          <XCircle className="h-6 w-6" />
        ) : (
          <CheckCircle className="h-6 w-6" />
        ),
      description:
        rejectionStage === 3
          ? "Quotation was rejected by the client"
          : "Quotation was accepted by the client",
    },
    {
      id: 4,
      title: "Invoice Issued",
      icon: <FileInvoice className="h-6 w-6" />,
      description: "Invoice has been issued based on the accepted quotation",
    },
    {
      id: 5,
      title: "Payment Received",
      icon: <DollarSign className="h-6 w-6" />,
      description: "Payment has been received for the invoice",
    },
  ];

  // Calculate progress percentage
  useEffect(() => {
    if (rejectionStage) {
      // If rejected, progress stops at rejection stage
      const targetProgress = ((rejectionStage - 1) / (stages.length - 1)) * 100;

      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 1000);

      setProgress(targetProgress);
      return () => clearTimeout(timer);
    } else {
      // Normal progress animation
      const targetProgress = ((currentStage - 1) / (stages.length - 1)) * 100;

      // Start with 0 progress
      setProgress(0);

      // Animate to target progress
      const timer = setTimeout(() => {
        setProgress(targetProgress);

        // Mark animation as complete after transition
        const completeTimer = setTimeout(() => {
          setAnimationComplete(true);
        }, 1000); // Match this with the CSS transition time

        return () => clearTimeout(completeTimer);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentStage, rejectionStage, stages.length]);

  return (
    <div className="w-full">
      {/* Horizontal progress bar (md screens and up) */}
      <div className="hidden lg:block">
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
          ))}
        </div>

        {/* Stage details for md+ screens */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={cn(
                "bg-gradient-to-b from-muted/20 to-muted/40 p-4 rounded-lg transition-all duration-500",
                stage.id === currentStage && !rejectionStage
                  ? "border border-primary bg-primary/10"
                  : stage.id === rejectionStage
                    ? "bg-destructive/10 border border-destructive"
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

              {stage.id < currentStage && (
                <div className="mt-2 flex items-center text-primary text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Completed</span>
                </div>
              )}

              {/* {stage.id === currentStage && !rejectionStage && (
                <div className="mt-2 flex items-center text-orange-600 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Current stage</span>
                </div>
              )} */}

              {stage.id === rejectionStage && (
                <div className="mt-2 flex items-center text-destructive text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  <span>Process stopped</span>
                </div>
              )}

              {stage.id === 1 && (
                <div className="mt-5 flex flex-wrap gap-2 items-center">
                  <QuotationReviewDrawer
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
      <div className="lg:hidden">
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

                  {stage.id < currentStage && (
                    <div className="mt-2 flex items-center text-primary text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Completed</span>
                    </div>
                  )}

                  {/* {stage.id === currentStage && !rejectionStage && (
                    <div className="mt-2 flex items-center text-orange-600 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Current stage</span>
                    </div>
                  )} */}

                  {stage.id === rejectionStage && (
                    <div className="mt-2 flex items-center text-red-600 text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      <span>Process stopped</span>
                    </div>
                  )}
                  {stage.id === 1 && (
                    <div className="mt-5 flex flex-wrap gap-2 items-center">
                      <QuotationReviewDrawer
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
