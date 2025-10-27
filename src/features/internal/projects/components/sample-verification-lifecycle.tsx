"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  UserCheck,
  ArrowRightCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PROJECT_BY_ID_QUERYResult,
  ALL_PERSONNEL_QUERYResult,
  SAMPLE_ADEQUACY_TEMPLATES_QUERYResult,
  SAMPLE_REVIEW_TEMPLATES_QUERYResult,
} from "../../../../../sanity.types";
import { Button } from "@/components/ui/button";
import { SampleVerificationDrawer } from "./sample-verification-drawer";
import { useRBAC } from "@/components/rbac-context";
import {
  submitSampleReceiptForApproval,
  approveSampleReceipt,
} from "@/lib/actions";
import { toast } from "sonner";

type SampleVerificationStage = {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
};

interface SampleVerificationLifecycleProps {
  project: PROJECT_BY_ID_QUERYResult[number];
  personnel: ALL_PERSONNEL_QUERYResult;
  sampleReviewTemplate: SAMPLE_REVIEW_TEMPLATES_QUERYResult[number];
  sampleAdequacyTemplate: SAMPLE_ADEQUACY_TEMPLATES_QUERYResult[number];
  existingSampleReceipt?: PROJECT_BY_ID_QUERYResult[number]["sampleReceipt"];
}

// Sample verification status types based on actual schema

type SampleVerificationStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "approved"
  | "sent_to_client"
  | "client_acknowledged"
  | "rejected";

function getSampleVerificationStage(status: SampleVerificationStatus): number {
  const stageMap: Record<SampleVerificationStatus, number> = {
    not_started: 1,
    draft: 1,
    submitted: 2,
    approved: 3,
    sent_to_client: 4,
    client_acknowledged: 5,
    rejected: 2, // Rejected goes back to stage 2 for resubmission
  };
  return stageMap[status] ?? 1;
}

// Get actual sample verification status from project data
function getSampleVerificationStatus(
  project: PROJECT_BY_ID_QUERYResult[number],
  existingSampleReceipt?: PROJECT_BY_ID_QUERYResult[number]["sampleReceipt"]
): SampleVerificationStatus {
  // Use the live existingSampleReceipt data if available, otherwise fall back to project.sampleReceipt
  const sampleReceipt = existingSampleReceipt || project.sampleReceipt;

  if (!sampleReceipt || !sampleReceipt._id) {
    return "not_started";
  }

  // Return the actual status from the sample receipt
  return sampleReceipt.status as SampleVerificationStatus;
}

function SampleVerificationStageCard({
  stage,
  currentStage,
  project,
  personnel,
  sampleReviewTemplate,
  sampleAdequacyTemplate,
  status,
  onSendForApproval,
  onApprove,
  isLoading,
}: {
  stage: SampleVerificationStage;
  currentStage: number;
  project: PROJECT_BY_ID_QUERYResult[number];
  personnel: ALL_PERSONNEL_QUERYResult;
  sampleReviewTemplate: SAMPLE_REVIEW_TEMPLATES_QUERYResult[number];
  sampleAdequacyTemplate: SAMPLE_ADEQUACY_TEMPLATES_QUERYResult[number];
  status: SampleVerificationStatus;
  onSendForApproval: () => void;
  onApprove: () => void;
  isLoading: boolean;
}) {
  const { role } = useRBAC();
  const isActive = stage.id === currentStage;
  const isCompleted = stage.id < currentStage;
  const isUpcoming = stage.id > currentStage;

  return (
    <div
      className={cn(
        "bg-gradient-to-b from-muted/20 to-muted/40 p-4 rounded-lg transition-all duration-500",
        isActive && "border border-primary bg-primary/10",
        isCompleted && "border border-muted-foreground",
        isUpcoming && "border border-muted"
      )}
    >
      <div className="flex items-center mb-2">
        <h3 className="font-semibold text-sm">{stage.title}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{stage.description}</p>

      {/* Completed stages */}
      {isCompleted && (
        <div className="mt-4 flex items-center text-primary text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>Completed</span>
        </div>
      )}

      {/* STAGE 1: Sample Receipt Creation */}
      {stage.id === 1 && isActive && (
        <div className="mt-5 flex flex-wrap gap-2 items-center">
          <SampleVerificationDrawer
            project={project}
            personnel={personnel}
            sampleReviewTemplate={sampleReviewTemplate}
            sampleAdequacyTemplate={sampleAdequacyTemplate}
          >
            <Button
              size="sm"
              variant={`${status === "not_started" ? "default" : "secondary"}`}
              className={` ${status === "not_started" ? "" : "bg-secondary text-secondary-foreground border border-primary/30"}`}
            >
              {status === "not_started"
                ? "Create Sample Receipt"
                : "Edit Sample Receipt"}
            </Button>
          </SampleVerificationDrawer>

          {status === "draft" && (
            <Button size="sm" onClick={onSendForApproval} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit for Approval"}
              <ArrowRightCircle className=" h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}

      {/* STAGE 2: Awaiting Approval */}
      {stage.id === 2 && isActive && (
        <div className="mt-4 flex-col items-center text-orange-500 text-xs">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {status === "rejected"
                ? "Rejected - needs revision"
                : "Awaiting approval"}
            </span>
          </div>

          {/* Approve button for admin users */}
          {role === "admin" &&
            (status === "submitted" || status === "rejected") && (
              <div className="mt-3">
                <SampleVerificationDrawer
                  project={project}
                  personnel={personnel}
                  sampleReviewTemplate={sampleReviewTemplate}
                  sampleAdequacyTemplate={sampleAdequacyTemplate}
                  isReadOnly={true}
                  onApprove={onApprove}
                >
                  <Button size="sm" disabled={isLoading}>
                    {isLoading ? "Approving..." : "Approve"}
                    <CheckCircle className=" h-4 w-4 ml-2" />
                  </Button>
                </SampleVerificationDrawer>
              </div>
            )}
        </div>
      )}

      {/* STAGE 3: Approved Internally */}
      {stage.id === 3 && isActive && (
        <div className="mt-4 flex items-center text-green-600 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>Sample receipt approved internally</span>
        </div>
      )}

      {/* STAGE 4: Sent to Client */}
      {stage.id === 4 && isActive && (
        <div className="mt-4 flex items-center text-blue-600 text-xs">
          <UserCheck className="h-3 w-3 mr-1" />
          <span>Sent to client for acknowledgement</span>
        </div>
      )}

      {/* STAGE 5: Client Acknowledged */}
      {stage.id === 5 && isActive && (
        <div className="mt-4 flex items-center text-green-600 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>Client has acknowledged receipt</span>
        </div>
      )}
    </div>
  );
}

export function SampleVerificationLifecycle({
  project,
  personnel,
  sampleReviewTemplate,
  sampleAdequacyTemplate,
  existingSampleReceipt,
}: SampleVerificationLifecycleProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // State management for sample verification process
  const [currentStatus, setCurrentStatus] = useState<SampleVerificationStatus>(
    getSampleVerificationStatus(project, existingSampleReceipt)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update status when existingSampleReceipt changes (for live updates)
  useEffect(() => {
    const newStatus = getSampleVerificationStatus(
      project,
      existingSampleReceipt
    );
    setCurrentStatus(newStatus);
  }, [project, existingSampleReceipt]);

  const currentStage = getSampleVerificationStage(currentStatus);

  // Handle sending for approval
  const handleSendForApproval = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("sampleReceiptId", existingSampleReceipt?._id || "");
      formData.append("projectId", project._id);

      const result = await submitSampleReceiptForApproval({}, formData);

      if (result.status === "ok") {
        toast.success("Sample receipt submitted for approval successfully!");
        setCurrentStatus("submitted");
      } else {
        toast.error(
          result.error || "Failed to submit sample receipt for approval"
        );
      }
    } catch (error) {
      console.error("Failed to send for approval:", error);
      toast.error("Failed to submit sample receipt for approval");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approving sample receipt
  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("sampleReceiptId", existingSampleReceipt?._id || "");
      formData.append("projectId", project._id);
      formData.append("getlabAcknowledgement", ""); // Empty for now, will be filled in the drawer

      const result = await approveSampleReceipt({}, formData);

      if (result.status === "ok") {
        toast.success("Sample receipt approved successfully!");
        setCurrentStatus("approved");
      } else {
        toast.error(result.error || "Failed to approve sample receipt");
      }
    } catch (error) {
      console.error("Failed to approve sample receipt:", error);
      toast.error("Failed to approve sample receipt");
    } finally {
      setIsLoading(false);
    }
  };

  // Define stage configurations with dynamic descriptions
  const getStageDescription = (stageId: number): string => {
    switch (stageId) {
      case 1:
        if (currentStatus === "not_started") {
          return "Create and prepare the sample receipt document for verification";
        } else if (currentStatus === "draft") {
          return "Sample receipt created. Ready to submit for approval";
        }
        return "Create and prepare the sample receipt document for verification";
      case 2:
        if (currentStatus === "submitted") {
          return "Sample receipt submitted and pending internal approval";
        } else if (currentStatus === "rejected") {
          return "Sample receipt was rejected. Please review and resubmit";
        }
        return "Sample receipt is pending internal approval from GETLAB personnel";
      case 3:
        if (currentStatus === "approved") {
          return "Sample receipt has been approved internally and ready to send to client";
        }
        return "Sample receipt approved internally and ready for client communication";
      case 4:
        if (currentStatus === "sent_to_client") {
          return "Sample receipt has been sent to client for acknowledgement";
        }
        return "Sample receipt sent to client and awaiting acknowledgement";
      case 5:
        if (currentStatus === "client_acknowledged") {
          return "Client has acknowledged the sample receipt. Process complete.";
        }
        return "Client acknowledgement received. Sample receipt process complete.";
      default:
        return "";
    }
  };

  const stages: SampleVerificationStage[] = [
    {
      id: 1,
      title:
        currentStatus === "draft"
          ? "Sample Receipt Draft"
          : "Create Sample Receipt",
      icon: <FileText className="h-3 w-3" />,
      description: getStageDescription(1),
    },
    {
      id: 2,
      title: currentStatus === "rejected" ? "Rejected" : "Awaiting Approval",
      icon: <UserCheck className="h-3 w-3" />,
      description: getStageDescription(2),
    },
    {
      id: 3,
      title: "Approved Internally",
      icon: <CheckCircle className="h-3 w-3" />,
      description: getStageDescription(3),
    },
    {
      id: 4,
      title: "Sent to Client",
      icon: <UserCheck className="h-3 w-3" />,
      description: getStageDescription(4),
    },
    {
      id: 5,
      title: "Client Acknowledged",
      icon: <CheckCircle className="h-3 w-3" />,
      description: getStageDescription(5),
    },
  ];

  // Progress bar & focus logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    timers.current.push(timer);

    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Header */}

      {/* Horizontal progress bar (desktop) */}
      <div className="hidden xl:block">
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-1000 ease-in-out"
              style={{
                width: `${((currentStage - 1) / (stages.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Stage markers */}
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
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                  stage.id <= currentStage
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                <span className="text-xs font-bold">{stage.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stage cards for desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mt-10">
          {stages.map((stage) => (
            <SampleVerificationStageCard
              key={stage.id}
              stage={stage}
              currentStage={currentStage}
              project={project}
              personnel={personnel}
              sampleReviewTemplate={sampleReviewTemplate}
              sampleAdequacyTemplate={sampleAdequacyTemplate}
              status={currentStatus}
              onSendForApproval={handleSendForApproval}
              onApprove={handleApprove}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Vertical progress bar (mobile) */}
      <div className="xl:hidden">
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-1 bg-gray-200 rounded-full">
            <div
              className="absolute w-1 bg-primary rounded-full transition-all duration-1000 ease-in-out left-0 top-0"
              style={{
                height: `${((currentStage - 1) / (stages.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Cards with aligned dots */}
          <div className="space-y-4 pl-10">
            {stages.map((stage) => (
              <div key={stage.id} className="relative">
                {/* Dot marker */}
                <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                      stage.id <= currentStage
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    <span className="text-xs font-bold">{stage.id}</span>
                  </div>
                </div>

                {/* Stage card */}
                <SampleVerificationStageCard
                  stage={stage}
                  currentStage={currentStage}
                  project={project}
                  personnel={personnel}
                  sampleReviewTemplate={sampleReviewTemplate}
                  sampleAdequacyTemplate={sampleAdequacyTemplate}
                  status={currentStatus}
                  onSendForApproval={handleSendForApproval}
                  onApprove={handleApprove}
                  isLoading={isLoading}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
