import type React from "react";

import {
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
  useRef,
} from "react";
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  DollarSign,
  Plus,
  CircleDashed,
  ReceiptText,
  FileIcon,
  ExternalLink,
  GitPullRequest,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
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
import { RevisionNotesDialog } from "./revision-notes-dialog";
import { MakePaymentDialog } from "./make-payment-dialog";
import { ViewPaymentsDialog } from "./view-payment-dialog";
import { RemakePaymentDialog } from "./remake-payment";

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
    unit: string;
  }[];
  setMobilizationActivities: Dispatch<
    SetStateAction<
      { activity: string; price: number; quantity: number; unit: string }[]
    >
  >;
  reportingActivities: {
    activity: string;
    price: number;
    quantity: number;
    unit: string;
  }[];
  setReportingActivities: Dispatch<
    SetStateAction<
      { activity: string; price: number; quantity: number; unit: string }[]
    >
  >;
}

export function calculatePaymentStatus(
  quotation: NonNullable<PROJECT_BY_ID_QUERYResult[number]["quotation"]>
) {
  if (!quotation) {
    return {
      totalPaymentsMade: 0,
      allPaymentsApproved: false,
      somePaymentsRejected: false,
      allPaymentsRejected: false,
      someResubmissionsRejected: false,
      allResubmissionsRejected: false,
      balanceDue: 0,
      allClear: false,
      allClearWaitingApproval: false,
      requiresAdvance: false,
      noAdvancePaymentsYet: false,
    };
  }

  // Calculate total approved payments
  const totalApprovedPayments =
    quotation.payments?.reduce((sum: number, payment: any) => {
      const approvedResubmissions = (payment.resubmissions ?? []).filter(
        (resubmission: any) => resubmission.internalStatus === "approved"
      );
      const latestApprovedResubmission =
        approvedResubmissions[approvedResubmissions.length - 1];

      if (latestApprovedResubmission) {
        return sum + (latestApprovedResubmission.amount ?? 0);
      }

      if (payment.internalStatus === "approved") {
        return sum + (payment.amount ?? 0);
      }

      return sum;
    }, 0) ?? 0;

  // Check if all payments are approved
  const allPaymentsApproved =
    quotation.payments?.every((payment: any) => {
      if (payment.internalStatus === "approved") return true;
      const resubmissions = payment.resubmissions ?? [];
      return resubmissions.some(
        (resubmission: any) => resubmission.internalStatus === "approved"
      );
    }) ?? false;

  // Check for rejected payments (excluding those with approved resubmissions)
  const somePaymentsRejected =
    quotation.payments?.some((payment: any) => {
      if (payment.internalStatus !== "rejected") return false;
      const resubmissions = payment.resubmissions ?? [];
      const hasViableResubmission = resubmissions.some(
        (resubmission: any) =>
          resubmission.internalStatus === "approved" ||
          resubmission.internalStatus === "pending"
      );
      return !hasViableResubmission;
    }) ?? false;

  const allPaymentsRejected =
    quotation.payments?.every((payment: any) => {
      // If payment is rejected, check if it has any approved or pending resubmissions
      if (payment.internalStatus === "rejected") {
        const resubmissions = payment.resubmissions ?? [];
        const hasActiveResubmission = resubmissions.some(
          (resubmission: any) =>
            resubmission.internalStatus === "approved" ||
            resubmission.internalStatus === "pending"
        );
        return !hasActiveResubmission;
      }

      // If payment is not rejected, it's not considered rejected
      return false;
    }) ?? false;

  const someResubmissionsRejected =
    quotation.payments?.some((payment: any) =>
      payment.resubmissions?.some(
        (resubmission: any) => resubmission.internalStatus === "rejected"
      )
    ) ?? false;

  const allResubmissionsRejected =
    quotation.payments?.every((payment: any) =>
      payment.resubmissions?.every(
        (resubmission: any) => resubmission.internalStatus === "rejected"
      )
    ) ?? false;

  const balanceDue = (quotation.grandTotal ?? 0) - totalApprovedPayments;

  const allClear = allPaymentsApproved && balanceDue === 0;
  const allClearWaitingApproval = !allPaymentsApproved && balanceDue === 0;

  // Check advance payment requirements
  const requiresAdvance = quotation.advance && quotation.advance > 0;

  const noAdvancePaymentsYet =
    quotation.payments?.every(
      (payment: any) => payment.paymentType !== "advance"
    ) ?? true;

  const advanceRejected = quotation.payments?.some((payment: any) => {
    if (payment.paymentType !== "advance") return false;

    // If payment is rejected, check if it has resubmissions
    if (payment.internalStatus === "rejected") {
      const resubmissions = payment.resubmissions ?? [];

      // If no resubmissions, advance is rejected
      if (resubmissions.length === 0) return true;

      // If has resubmissions, check if all are rejected
      const allResubmissionsRejected = resubmissions.every(
        (resubmission: any) => resubmission.internalStatus === "rejected"
      );

      return allResubmissionsRejected;
    }

    return false;
  });

  return {
    totalApprovedPayments,
    allPaymentsApproved,
    somePaymentsRejected,
    allPaymentsRejected,
    someResubmissionsRejected,
    allResubmissionsRejected,
    balanceDue,
    allClear,
    allClearWaitingApproval,
    requiresAdvance,
    noAdvancePaymentsYet,
    advanceRejected,
  };
}

function getPaymentStageInfo(
  paymentStatus: ReturnType<typeof calculatePaymentStatus>,
  quotation: any,
  currentStage: number
) {
  const {
    requiresAdvance,
    noAdvancePaymentsYet,
    somePaymentsRejected,
    allPaymentsRejected,
    allResubmissionsRejected,
    allClear,
    allClearWaitingApproval,
    balanceDue,
    advanceRejected,
  } = paymentStatus;

  // Determine title based on payment state
  let title = "Awaiting Payment";
  if (requiresAdvance && noAdvancePaymentsYet) {
    title = "Awaiting Advance";
  } else if (
    (allPaymentsRejected || allResubmissionsRejected) &&
    !advanceRejected
  ) {
    title = "All Payments Rejected";
  } else if (advanceRejected) {
    title = "Advance Rejected";
  } else if (somePaymentsRejected && !allPaymentsRejected && balanceDue === 0) {
    title = "Some Payments Rejected";
  } else if (allClear) {
    title = "All Payments Approved";
  } else if (allClearWaitingApproval) {
    title = "All Payments Sent";
  } else if (quotation?.status === "partially_paid" && balanceDue > 0) {
    title = "Partial Payment Received";
  }

  // Determine description based on payment state
  let description = "Awaiting payments for the issued invoice";
  if (requiresAdvance && noAdvancePaymentsYet && currentStage >= 5) {
    description = `${quotation?.advance}% advance payment is required for the issued invoice`;
  } else if (allPaymentsRejected && !advanceRejected) {
    description =
      "All payments have been rejected. Please review and resubmit.";
  } else if (advanceRejected) {
    description =
      "Advance payment has been rejected. Please review and resubmit.";
  } else if (somePaymentsRejected && !allPaymentsRejected && balanceDue === 0) {
    description =
      "Some payments have been rejected. Please review and resubmit.";
  } else if (allClear) {
    description =
      "All payments have been approved and the invoice is fully paid.";
  } else if (allClearWaitingApproval) {
    description = "All payments have been sent and are pending approval.";
  }

  return { title, description };
}

function getStageCardClassName(
  stage: Stage,
  currentStage: number,
  rejectionStage: number | undefined,
  quotationNeedsRevision: boolean,
  paymentStatus: ReturnType<typeof calculatePaymentStatus>
) {
  const {
    allClear,
    allClearWaitingApproval,
    somePaymentsRejected,
    allPaymentsRejected,
    balanceDue,
  } = paymentStatus;

  const baseClasses =
    "bg-gradient-to-b from-muted/20 to-muted/40 p-4 rounded-lg transition-all duration-500";

  // Stage 5 (payment) special cases — only when we're at or past stage 5
  if (stage.id === 5 && currentStage >= 5) {
    if (allClear) {
      return cn(baseClasses, "border border-primary bg-primary/10");
    }
    if (allClearWaitingApproval) {
      return cn(baseClasses, "bg-orange-500/10 border border-orange-500");
    }
    if (somePaymentsRejected || allPaymentsRejected) {
      return cn(baseClasses, "bg-destructive/10 border border-destructive");
    }
    // Partial payment received with no rejections
    if (balanceDue > 0 && !somePaymentsRejected && !allPaymentsRejected) {
      return cn(baseClasses, "bg-orange-500/10 border border-orange-500");
    }
  }

  // Current stage (active)
  if (
    stage.id === currentStage &&
    !rejectionStage &&
    !(
      stage.id === 5 &&
      (allClearWaitingApproval || somePaymentsRejected || allPaymentsRejected)
    )
  ) {
    return cn(baseClasses, "border border-primary bg-primary/10");
  }

  // Rejection cases
  if (stage.id === rejectionStage) {
    if (!quotationNeedsRevision) {
      return cn(baseClasses, "bg-destructive/10 border border-destructive");
    }
    if (stage.id === 3 && quotationNeedsRevision) {
      return cn(baseClasses, "bg-orange-500/10 border border-orange-500");
    }
  }

  // Completed stages
  if (stage.id < currentStage && !rejectionStage) {
    return cn(baseClasses, "border border-muted-foreground");
  }

  // Default
  return cn(baseClasses, "border");
}

function getStageMarkerClassName(
  stage: Stage,
  currentStage: number,
  rejectionStage: number | undefined,
  quotationNeedsRevision: boolean,
  animationComplete: boolean,
  paymentStatus: ReturnType<typeof calculatePaymentStatus>
) {
  const baseClasses =
    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out";

  let colorClasses = "";

  // Stage 5 special cases for payment status — only when we're at or past stage 5
  if (stage.id === 5 && currentStage >= 5) {
    const {
      allClear,
      allClearWaitingApproval,
      somePaymentsRejected,
      allPaymentsRejected,
      balanceDue,
    } = paymentStatus;

    if (allClear) {
      colorClasses = "bg-primary text-white";
    } else if (allClearWaitingApproval) {
      colorClasses = "bg-orange-500 text-white";
    } else if (somePaymentsRejected || allPaymentsRejected) {
      colorClasses = "bg-destructive text-destructive-foreground";
    } else if (
      balanceDue > 0 &&
      !somePaymentsRejected &&
      !allPaymentsRejected
    ) {
      colorClasses = "bg-orange-500 text-white";
    } else {
      colorClasses = "bg-gray-200 text-gray-400";
    }
  } else if (stage.id < currentStage && !rejectionStage) {
    colorClasses = "bg-primary text-primary-foreground";
  } else if (stage.id === currentStage && !rejectionStage) {
    colorClasses = "bg-primary text-white";
  } else if (rejectionStage && stage.id <= rejectionStage) {
    if (stage.id === rejectionStage && !quotationNeedsRevision) {
      colorClasses = "bg-destructive text-destructive-foreground";
    } else if (stage.id === rejectionStage && quotationNeedsRevision) {
      colorClasses = "bg-orange-500 border border-orange-500";
    } else {
      colorClasses = "bg-primary text-primary-foreground";
    }
  } else {
    colorClasses = "bg-gray-200 text-gray-400";
  }

  let ringClasses = "";
  if (stage.id === currentStage && animationComplete && !rejectionStage) {
    ringClasses = "ring-4 ring-emerald-100";
  } else if (stage.id === rejectionStage && animationComplete) {
    ringClasses = "ring-4 ring-red-100";
  }

  return cn(baseClasses, colorClasses, ringClasses);
}

function StageCard({
  stage,
  currentStage,
  rejectionStage,
  quotation,
  quotationNeedsRevision,
  role,
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
  paymentStatus,
}: {
  stage: Stage;
  currentStage: number;
  rejectionStage: number | undefined;
  quotation: any;
  quotationNeedsRevision: boolean;
  role: string;
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
    unit: string;
  }[];
  setMobilizationActivities: Dispatch<
    SetStateAction<
      { activity: string; price: number; quantity: number; unit: string }[]
    >
  >;
  reportingActivities: {
    activity: string;
    price: number;
    quantity: number;
    unit: string;
  }[];
  setReportingActivities: Dispatch<
    SetStateAction<
      { activity: string; price: number; quantity: number; unit: string }[]
    >
  >;
  paymentStatus: ReturnType<typeof calculatePaymentStatus>;
}) {
  const { allClear, allClearWaitingApproval, advanceRejected } = paymentStatus;

  return (
    <div
      className={getStageCardClassName(
        stage,
        currentStage,
        rejectionStage,
        quotationNeedsRevision,
        paymentStatus
      )}
    >
      <div className="flex items-center mb-2">
        <h3 className="font-semibold text-sm">{stage.title}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{stage.description}</p>

      {/* Completed stages */}
      {stage.id < currentStage && (
        <div className="mt-4 flex items-center text-primary text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>Completed</span>
        </div>
      )}

      {/* STAGE 1: Quotation Preparation */}
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

      {/* STAGE 2: Quotation Sent */}
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

      {/* STAGE 3: Client Feedback */}
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
          <div className="mt-4 flex gap-2 items-center text-orange-500 text-xs">
            <RevisionNotesDialog
              revisionText={quotation?.rejectionNotes || ""}
            />
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

      {/* STAGE 4: Invoice Generated */}
      {quotation && quotation.status === "invoiced" && stage.id === 4 && (
        <div className="mt-5 flex flex-wrap gap-2 items-center">
          <Button
            variant="secondary"
            size="sm"
            className="border border-primary/30"
          >
            <Link
              className="flex items-center"
              href={quotation?.invoice?.asset?.url || ""}
              target="_blank"
            >
              <ExternalLink className="text-primary h-4 w-4 mr-2" />
              View Invoice
            </Link>
          </Button>
        </div>
      )}

      {/* STAGE 5: Payment */}
      {(quotation?.status === "invoiced" ||
        quotation?.status === "partially_paid" ||
        quotation?.status === "fully_paid") &&
        stage.id === 5 && (
          <>
            <div
              className={`mt-4 flex items-center ${allClear ? "text-primary" : "text-orange-500"} text-xs`}
            >
              {allClear ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <CircleDashed className="animate-spin h-3 w-3 mr-1" />
              )}
              <span>
                {allClear
                  ? "Fully paid"
                  : allClearWaitingApproval
                    ? "Payments pending approval"
                    : "Awaiting client payments"}
              </span>
            </div>
            <div className="mt-5 space-y-2">
              {advanceRejected ? (
                <RemakePaymentDialog
                  quotationId={quotation?._id}
                  currency={quotation?.currency as string}
                  rejectedPayment={quotation?.payments?.find(
                    (payment: any) => payment.paymentType === "advance"
                  )}
                />
              ) : !allClear && !advanceRejected ? (
                <MakePaymentDialog
                  quotationId={quotation?._id}
                  total={quotation?.grandTotal as number}
                  currency={quotation?.currency as string}
                  advancePercentage={quotation?.advance || 0}
                  existingPayments={quotation?.payments || []}
                />
              ) : null}
              <ViewPaymentsDialog
                quotationId={quotation?._id}
                total={quotation?.grandTotal as number}
                currency={quotation?.currency as string}
                existingPayments={quotation?.payments || []}
                project={project as PROJECT_BY_ID_QUERYResult[number]}
                quotation={
                  quotation as NonNullable<
                    PROJECT_BY_ID_QUERYResult[number]["quotation"]
                  >
                }
              />
            </div>
          </>
        )}
    </div>
  );
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

  const paymentStatus = calculatePaymentStatus(
    quotation as NonNullable<PROJECT_BY_ID_QUERYResult[number]["quotation"]>
  );
  const paymentStageInfo = getPaymentStageInfo(
    paymentStatus,
    quotation,
    currentStage
  );

  // Define stage configurations
  const stages: Stage[] = [
    {
      id: 1,
      title: isClientWaitingForParentQuotation
        ? "Awaiting Quotation"
        : isAdminWaitingToCreateQuotation
          ? "Quotation Drafting"
          : "Quotation Prepared",
      icon: isParentQuotationCreated ? (
        <FileText className="h-3 w-3" />
      ) : (
        <Plus className="h-3 w-3" />
      ),
      description: isClientWaitingForParentQuotation
        ? "Pending quotation creation by GETLAB"
        : isAdminWaitingToCreateQuotation
          ? "A quotation must be drafted to proceed with billing"
          : "Quotation has been prepared by GETLAB",
    },
    {
      id: 2,
      title: "Quotation Sent",
      icon: <Send className="h-3 w-3" />,
      description: "Quotation has been delivered to the client for review",
    },
    {
      id: 3,
      title: "Client Feedback",
      icon:
        rejectionStage === 3 ? (
          <XCircle className="h-3 w-3" />
        ) : (
          <CheckCircle className="h-3 w-3" />
        ),
      description:
        rejectionStage === 3 && !quotationNeedsRevision
          ? "Client declined the quotation"
          : rejectionStage === 3 && quotationNeedsRevision
            ? "Client requested revisions to the quotation"
            : quotation?.status === "invoiced"
              ? "Client accepted the quotation"
              : "Revisions may be submitted at this stage if needed",
    },
    {
      id: 4,
      title: "Invoice Generated",
      icon: <FileIcon className="h-3 w-3" />,
      description: "Invoice issued based on client-approved quotation",
    },
    {
      id: 5,
      title: paymentStageInfo.title,
      icon: <DollarSign className="h-3 w-3" />,
      description: paymentStageInfo.description,
    },
  ];

  // Progress bar & focus logic
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setAnimationComplete(false);

    const isRejected = typeof rejectionStage === "number";
    const effectiveStage = isRejected ? rejectionStage : currentStage;
    const target = ((effectiveStage - 1) / (stages.length - 1)) * 100;

    if (isRejected) {
      setProgress(target);
      timers.current.push(setTimeout(() => setAnimationComplete(true), 1000));
      return;
    }

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
      {/* Horizontal progress bar (desktop) */}
      <div className="hidden xl:block">
        <div className="relative h-1 bg-gray-200 rounded-full mb-10 mt-6 flex items-center">
          <div
            className="absolute h-1 bg-primary rounded-full transition-all duration-1000 ease-in-out top-0 left-0"
            style={{ width: `${progress}%` }}
          />

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
                className={getStageMarkerClassName(
                  stage,
                  currentStage,
                  rejectionStage,
                  quotationNeedsRevision,
                  animationComplete,
                  paymentStatus
                )}
              >
                <span className="text-xs font-bold">{stage.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stage cards for desktop */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {stages.map((stage) => (
            <StageCard
              key={stage.id}
              stage={stage}
              currentStage={currentStage}
              rejectionStage={rejectionStage}
              quotation={quotation}
              quotationNeedsRevision={quotationNeedsRevision}
              role={role}
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
              paymentStatus={paymentStatus}
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
              style={{ height: `${progress}%` }}
            />
          </div>

          {/* Cards with aligned dots */}
          <div className="space-y-4 pl-10">
            {stages.map((stage) => (
              <div key={stage.id} className="relative">
                {/* Dot marker */}
                <div className="absolute -left-10 top-1/2 -translate-y-1/2">
                  <div
                    className={getStageMarkerClassName(
                      stage,
                      currentStage,
                      rejectionStage,
                      quotationNeedsRevision,
                      animationComplete,
                      paymentStatus
                    )}
                  >
                    <span className="text-xs font-bold">{stage.id}</span>
                  </div>
                </div>

                {/* Stage card */}
                <StageCard
                  stage={stage}
                  currentStage={currentStage}
                  rejectionStage={rejectionStage}
                  quotation={quotation}
                  quotationNeedsRevision={quotationNeedsRevision}
                  role={role}
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
                  paymentStatus={paymentStatus}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
