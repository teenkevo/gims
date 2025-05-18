import type React from "react";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CheckCircle,
  CircleDashed,
  DollarSign,
  ExternalLink,
  FileIcon,
  FileText,
  Plus,
  ReceiptText,
  Send,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuotationDrawer } from "./quotation-drawer";
import { SendQuotationDialog } from "./send-quotation-dialog";
import { useRBAC } from "@/components/rbac-context";
import type {
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../sanity.types";
import { RespondToQuotationDialog } from "./respond-to-quotation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Types
interface Stage {
  id: number;
  title: string;
  icon: ReactNode;
  description: string;
}

interface Activity {
  activity: string;
  price: number;
  quantity: number;
}

interface BillingLifecycleProps {
  currentStage?: number;
  rejectionStage?: number;
  allServices: ALL_SERVICES_QUERYResult;
  project: PROJECT_BY_ID_QUERYResult[number];
  selectedLabTests: ALL_SERVICES_QUERYResult;
  setSelectedLabTests: React.Dispatch<React.SetStateAction<ALL_SERVICES_QUERYResult>>;
  selectedFieldTests: ALL_SERVICES_QUERYResult;
  setSelectedFieldTests: React.Dispatch<React.SetStateAction<ALL_SERVICES_QUERYResult>>;
  mobilizationActivities: Activity[];
  setMobilizationActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  reportingActivities: Activity[];
  setReportingActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
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
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { quotation } = project;
  const { role } = useRBAC();

  const isClient = role === "client";
  const isAdmin = role === "admin";

  // Define stage configurations
  // TODO: Work on roles here
  const stages: Stage[] = [
    {
      id: 1,
      title:
        !quotation && isClient
          ? "Waiting for Quotation"
          : !quotation && isAdmin
            ? "Create Quotation"
            : "Quotation Created",
      icon: quotation ? <FileText className="h-3 w-3" /> : <Plus className="h-3 w-3" />,
      description:
        !quotation && isClient
          ? "Waiting for quotation to be created by GETLAB"
          : !quotation && isAdmin
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
        rejectionStage === 3
          ? "Quotation was rejected by the client"
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

  // Handle progress animation
  useEffect(() => {
    // Clear any existing timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setAnimationComplete(false);

    const isRejected = typeof rejectionStage === "number";
    const effectiveStage = isRejected ? rejectionStage : currentStage;
    const targetProgress = ((effectiveStage - 1) / (stages.length - 1)) * 100;

    // Set up animation sequence
    setProgress(0);

    const animationTimer = setTimeout(
      () => {
        setProgress(targetProgress);

        const completionTimer = setTimeout(() => {
          setAnimationComplete(true);
        }, 1000);

        timersRef.current.push(completionTimer);
      },
      isRejected ? 0 : 300
    );

    timersRef.current.push(animationTimer);

    // Cleanup timers on unmount
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [currentStage, rejectionStage, stages.length]);

  // Determine stage status
  const getStageStatus = (stageId: number) => {
    const isRejected = rejectionStage !== undefined && stageId <= rejectionStage;
    const isCurrentStage = stageId === currentStage && !isRejected;
    const isCompleted = stageId < currentStage && !isRejected;

    return { isRejected, isCurrentStage, isCompleted };
  };

  // Render status badge based on stage state
  const renderStatusBadge = (stageId: number) => {
    // Special case: Process stopped at rejection stage
    if (stageId === rejectionStage) {
      return (
        <div className="mt-4 flex items-center text-destructive text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          <span>Process stopped</span>
        </div>
      );
    }

    // Special case: Stage 1 without quotation
    if (stageId === 1 && !quotation) {
      return (
        <div className="mt-4 flex items-center text-orange-600 text-xs">
          <CircleDashed className="h-3 w-3 mr-1" />
          <span>Pending</span>
        </div>
      );
    }

    // Special case: Stage 1 with draft quotation
    if (quotation && stageId === 1 && quotation.status === "draft") {
      return (
        <div className="mt-4 flex items-center text-orange-600 text-xs">
          <ReceiptText className="h-3 w-3 mr-1" />
          <span>Draft not yet sent</span>
        </div>
      );
    }

    // Special case: Stage 2 with sent quotation
    if (quotation && stageId === 3 && quotation.status !== "draft") {
      return (
        <div className="mt-4 flex items-center text-orange-600 text-xs">
          <CircleDashed className="animate-spin h-3 w-3 mr-1" />
          <span>Awaiting client response</span>
        </div>
      );
    }

    // Completed stage
    const { isCompleted } = getStageStatus(stageId);
    if (isCompleted) {
      return (
        <div className="mt-4 flex items-center text-primary text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>Completed</span>
        </div>
      );
    }

    return null;
  };

  // Render stage marker (number indicator)
  const StageMarker = ({ stageId }: { stageId: number }) => {
    const { isRejected, isCurrentStage, isCompleted } = getStageStatus(stageId);

    // Determine marker styling based on stage status
    const markerClasses = cn(
      "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out",
      isCompleted
        ? "bg-primary text-primary-foreground"
        : isCurrentStage
          ? "bg-primary text-white"
          : stageId === rejectionStage
            ? "bg-destructive text-destructive-foreground"
            : isRejected
              ? "bg-primary text-primary-foreground"
              : "bg-gray-200 text-gray-400",

      // Animation ring
      isCurrentStage && animationComplete
        ? "ring-4 ring-emerald-100"
        : stageId === rejectionStage && animationComplete
          ? "ring-4 ring-red-100"
          : ""
    );

    return (
      <div className={markerClasses}>
        <span className="text-xs font-bold">{stageId}</span>
      </div>
    );
  };

  // Render stage card with content
  const StageCard = ({ stage, isVertical = false }: { stage: Stage; isVertical?: boolean }) => {
    const { isRejected, isCurrentStage, isCompleted } = getStageStatus(stage.id);

    // Determine card styling based on stage status
    const cardClasses = cn(
      "bg-gradient-to-b from-muted/20 to-muted/40 p-4 rounded-lg transition-all duration-500 border",
      isCurrentStage
        ? "border-primary bg-primary/10"
        : stage.id === rejectionStage
          ? "bg-destructive/10 border-destructive"
          : isCompleted
            ? "border-primary"
            : ""
    );

    // Determine icon container styling
    const iconContainerClasses = cn(
      "p-2 rounded-full mr-2",
      isCurrentStage
        ? "bg-primary/10"
        : stage.id === rejectionStage
          ? "bg-destructive/10"
          : "bg-muted-foreground/10"
    );

    return (
      <div className={cardClasses}>
        <div className="flex items-center mb-2">
          <div className={iconContainerClasses}>{stage.icon}</div>
          <h3 className="font-semibold text-sm">{stage.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{stage.description}</p>
        {renderStatusBadge(stage.id)}

        {/* TODO: Work on roles here */}
        {/* Quotation actions for stage 1 */}
        {stage.id === 1 && role === "admin" && (
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
        {stage.id === 2 && quotation?.status === "sent" && (
          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <Button variant="secondary" size="sm">
              <Link
                className="flex items-center"
                href={quotation?.file?.asset?.url || ""}
                target="_blank"
              >
                <ExternalLink className="text-primary h-4 w-4 mr-2" />
                View quotation
              </Link>
            </Button>
          </div>
        )}
        {stage.id === 3 && role === "client" && quotation?.status === "sent" && (
          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <RespondToQuotationDialog project={project} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden xl:block">
        {/* Progress bar */}
        <div className="relative h-1 bg-gray-200 rounded-full mb-10 mt-6 flex items-center">
          <div
            className="absolute h-1 bg-primary rounded-full transition-all duration-1000 ease-in-out top-0 left-0"
            style={{ width: `${progress}%` }}
          />

          {/* Stage markers */}
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${((stage.id - 1) / (stages.length - 1)) * 100}%` }}
            >
              <StageMarker stageId={stage.id} />
            </div>
          ))}
        </div>

        {/* Stage cards */}
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage) => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="xl:hidden relative">
        {/* Vertical progress bar */}
        <div className="absolute left-3 top-0 bottom-0 w-1 bg-gray-200 rounded-full">
          <div
            className="absolute w-1 bg-primary rounded-full transition-all duration-1000 ease-in-out left-0 top-0"
            style={{ height: `${progress}%` }}
          />
        </div>

        {/* Vertical stage cards */}
        <div className="space-y-4 pl-10">
          {stages.map((stage) => (
            <div key={stage.id} className="relative">
              <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                <StageMarker stageId={stage.id} />
              </div>
              <StageCard stage={stage} isVertical />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
