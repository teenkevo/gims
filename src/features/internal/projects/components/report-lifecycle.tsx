"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  ArrowRightCircle,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { submitReportForQa } from "@/lib/report-actions";
import type {
  ALL_PERSONNEL_QUERY_RESULT,
  PROJECT_BY_ID_QUERY_RESULT,
} from "../../../../../sanity.types";
import { CreateReportDrawer } from "./create-report-drawer";
import { QaReviewDrawer } from "./qa-review-drawer";
import { ReportRevisionNotesDialog } from "./report-revision-notes-dialog";
import ReportFile from "./report-file";
import { ReportQueries } from "./report-queries";

type ProjectReport = NonNullable<PROJECT_BY_ID_QUERY_RESULT[number]["report"]>;

type ReportStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "revisions_requested"
  | "rejected"
  | "sent_to_client";

type ReportStage = {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
};

function getReportStatus(
  report?: PROJECT_BY_ID_QUERY_RESULT[number]["report"]
): ReportStatus {
  if (!report?._id) return "not_started";
  return (report.status as ReportStatus) || "draft";
}

function getReportStage(status: ReportStatus): number {
  const stageMap: Record<ReportStatus, number> = {
    not_started: 1,
    draft: 1,
    revisions_requested: 2,
    rejected: 2,
    submitted: 3,
    sent_to_client: 4,
  };
  return stageMap[status] ?? 1;
}

function isAwaitingQa(status: ReportStatus) {
  return status === "submitted";
}

function ReportStageCard({
  stage,
  currentStage,
  status,
  project,
  personnel,
  report,
  isLoading,
  onSubmitForQa,
}: {
  stage: ReportStage;
  currentStage: number;
  status: ReportStatus;
  project: PROJECT_BY_ID_QUERY_RESULT[number];
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  report?: ProjectReport | null;
  isLoading: boolean;
  onSubmitForQa: () => void;
}) {
  const { can, isClientUser, role } = useRBAC();
  const isActive = stage.id === currentStage;
  const isCompleted = stage.id < currentStage;
  const isUpcoming = stage.id > currentStage;
  const canCreate = can(PERMISSIONS["report:create"]);
  const canUpdate = can(PERMISSIONS["report:update"]);
  const canApprove = can(PERMISSIONS["report:approve"]) || role === "admin";

  return (
    <div
      className={cn(
        "bg-gradient-to-b from-muted/20 to-muted/40 p-4 rounded-lg transition-all duration-500",
        isActive &&
          (isAwaitingQa(status) ||
            status === "revisions_requested" ||
            status === "rejected") &&
          "border border-orange-500 bg-orange-500/10",
        isActive &&
          !isAwaitingQa(status) &&
          status !== "revisions_requested" &&
          status !== "rejected" &&
          "border border-primary bg-primary/10",
        isCompleted && "border border-muted-foreground",
        isUpcoming && "border border-muted"
      )}
    >
      <div className="flex items-center mb-2">
        <h3 className="font-semibold text-sm">{stage.title}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{stage.description}</p>

      {isCompleted && (
        <div className="mt-4 flex items-center text-primary text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>Completed</span>
        </div>
      )}

      {/* Stage 1: Create / draft */}
      {stage.id === 1 && isActive && !isClientUser && (
        <div className="mt-5 flex flex-wrap gap-2 items-center">
          {(canCreate || canUpdate) && (
            <CreateReportDrawer
              project={project}
              personnel={personnel}
              existingReport={report}
            >
              <Button
                size="sm"
                variant={status === "not_started" ? "default" : "secondary"}
                className={
                  status === "not_started"
                    ? ""
                    : "bg-secondary text-secondary-foreground border border-primary/30"
                }
              >
                {status === "not_started" ? "Submit report" : "Edit report"}
              </Button>
            </CreateReportDrawer>
          )}

          {status === "draft" && canUpdate && (
            <Button size="sm" onClick={onSubmitForQa} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit for QA"}
              <ArrowRightCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}

      {/* Stage 2: Revisions / rejected */}
      {stage.id === 2 && isActive && !isClientUser && (
        <div className="mt-4 flex-col items-center text-orange-500 text-xs">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {status === "rejected"
                ? "Rejected — needs revision"
                : "Revisions requested"}
            </span>
          </div>

          <div className="flex flex-row gap-2 mt-3">
            {report?.qaReview?.notes && (
              <ReportRevisionNotesDialog notes={report.qaReview.notes} />
            )}
            {canUpdate && (
              <CreateReportDrawer
                project={project}
                personnel={personnel}
                existingReport={report}
                isRevision
              >
                <Button size="sm" variant="default">
                  Revise report
                </Button>
              </CreateReportDrawer>
            )}
          </div>
        </div>
      )}

      {/* Stage 3: QA review */}
      {stage.id === 3 && isActive && (
        <div className="mt-4 flex-col items-center text-xs">
          {status === "sent_to_client" ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Completed</span>
            </div>
          ) : (
            <>
              <div className="flex items-center text-orange-500 mb-3">
                <Clock className="h-3 w-3 mr-1" />
                <span>Waiting for QA review</span>
              </div>
              {!isClientUser && canApprove && report && (
                <QaReviewDrawer project={project} reportId={report._id}>
                  <Button size="sm" disabled={isLoading}>
                    Accept / Reject / Revise
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </QaReviewDrawer>
              )}
            </>
          )}
        </div>
      )}

      {/* Stage 4: Sent to client */}
      {stage.id === 4 && isActive && (
        <div className="mt-5 space-y-2">
          {status === "sent_to_client" ? (
            <>
              <div className="flex items-center text-green-600 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Available to client</span>
              </div>
              <div className="flex items-center text-muted-foreground text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>Clients can query this report below</span>
              </div>
            </>
          ) : (
            <div className="flex items-center text-orange-500 text-xs">
              <Clock className="h-3 w-3 mr-1" />
              <span>Pending QA acceptance</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReportLifecycle({
  project,
  personnel = [],
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
  personnel?: ALL_PERSONNEL_QUERY_RESULT;
}) {
  const { isClientUser } = useRBAC();
  const report = project.report;
  const [status, setStatus] = useState<ReportStatus>(getReportStatus(report));
  const [isLoading, setIsLoading] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    setStatus(getReportStatus(report));
  }, [report]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const currentStage = getReportStage(status);

  const handleSubmitForQa = async () => {
    if (!report?._id) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("reportId", report._id);
      formData.append("projectId", project._id);
      const result = await submitReportForQa({}, formData);
      if (result.status === "ok") {
        toast.success("Report submitted for QA review");
        setStatus("submitted");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to submit report for QA");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit report for QA");
    } finally {
      setIsLoading(false);
    }
  };

  const stages: ReportStage[] = [
    {
      id: 1,
      title:
        status === "draft"
          ? "Report draft"
          : isClientUser
            ? "Report preparation"
            : "Submit report",
      icon: <FileText className="h-3 w-3" />,
      description:
        status === "draft"
          ? isClientUser
            ? "The lab is preparing your report."
            : "Report created. Ready to submit for QA review."
          : isClientUser
            ? "Waiting for the lab to prepare the report."
            : "Prepare and upload the project test report.",
    },
    {
      id: 2,
      title:
        status === "rejected"
          ? "Rejected"
          : status === "revisions_requested"
            ? "Revisions requested"
            : "Revision cycle",
      icon: <UserCheck className="h-3 w-3" />,
      description:
        status === "rejected" || status === "revisions_requested"
          ? isClientUser
            ? "The lab is addressing QA feedback."
            : "Address QA feedback and resubmit a revised report."
          : "QA may request revisions or reject the report for rework.",
    },
    {
      id: 3,
      title: "QA review",
      icon: <CheckCircle className="h-3 w-3" />,
      description: isAwaitingQa(status)
        ? "Waiting for QA to accept, reject, or request revisions."
        : "Internal quality review of the submitted report.",
    },
    {
      id: 4,
      title: "Sent to client",
      icon: <MessageSquare className="h-3 w-3" />,
      description:
        status === "sent_to_client"
          ? isClientUser
            ? "Your report is ready. You can download it and ask questions below."
            : "Report is available to the client. Queries can be raised and answered."
          : "Once accepted by QA, the report becomes available to the client.",
    },
  ];

  return (
    <div className="w-full space-y-10">
      <div className="hidden xl:block">
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all duration-1000 ease-in-out"
              style={{
                width: animationComplete
                  ? `${((currentStage - 1) / (stages.length - 1)) * 100}%`
                  : "0%",
              }}
            />
          </div>

          {stages.map((stage) => (
            <div
              key={stage.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out"
              style={{
                left: `${((stage.id - 1) / (stages.length - 1)) * 100}%`,
              }}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                  (isAwaitingQa(status) && stage.id === 3) ||
                    ((status === "revisions_requested" ||
                      status === "rejected") &&
                      stage.id === 2)
                    ? "bg-orange-500 text-white"
                    : stage.id <= currentStage
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-200 text-gray-500"
                )}
              >
                {stage.id}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mt-10">
          {stages.map((stage) => (
            <ReportStageCard
              key={stage.id}
              stage={stage}
              currentStage={currentStage}
              status={status}
              project={project}
              personnel={personnel}
              report={report}
              isLoading={isLoading}
              onSubmitForQa={handleSubmitForQa}
            />
          ))}
        </div>
      </div>

      <div className="xl:hidden">
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-1 bg-gray-200 rounded-full">
            <div
              className="absolute w-1 bg-primary rounded-full transition-all duration-1000 ease-in-out left-0 top-0"
              style={{
                height: animationComplete
                  ? `${((currentStage - 1) / (stages.length - 1)) * 100}%`
                  : "0%",
              }}
            />
          </div>

          <div className="space-y-4 pl-10">
            {stages.map((stage) => (
              <div key={stage.id} className="relative">
                <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                      (isAwaitingQa(status) && stage.id === 3) ||
                        ((status === "revisions_requested" ||
                          status === "rejected") &&
                          stage.id === 2)
                        ? "bg-orange-500 text-white"
                        : stage.id <= currentStage
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {stage.id}
                  </div>
                </div>
                <ReportStageCard
                  stage={stage}
                  currentStage={currentStage}
                  status={status}
                  project={project}
                  personnel={personnel}
                  report={report}
                  isLoading={isLoading}
                  onSubmitForQa={handleSubmitForQa}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {report && (
        <>
          <ReportFile project={project} />
          <ReportQueries project={project} report={report} />
        </>
      )}
    </div>
  );
}
