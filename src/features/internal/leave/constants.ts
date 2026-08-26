export const DEFAULT_ANNUAL_ENTITLEMENT_DAYS = 21;

export const LEAVE_TYPES = [
  { value: "annual", label: "Annual", countsTowardEntitlement: true },
  { value: "sick", label: "Sick", countsTowardEntitlement: false },
  { value: "compassionate", label: "Compassionate", countsTowardEntitlement: false },
  { value: "study", label: "Study", countsTowardEntitlement: false },
  { value: "parental", label: "Parental", countsTowardEntitlement: false },
  { value: "unpaid", label: "Unpaid", countsTowardEntitlement: false },
] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number]["value"];

export const LEAVE_PLAN_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "changes_requested", label: "Changes requested" },
] as const;

export type LeavePlanStatus = (typeof LEAVE_PLAN_STATUSES)[number]["value"];

export const LEAVE_SESSION_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "pending", label: "Pending approval" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export type LeaveSessionStatus = (typeof LEAVE_SESSION_STATUSES)[number]["value"];

export function getLeaveTypeLabel(type?: string | null) {
  return LEAVE_TYPES.find((item) => item.value === type)?.label ?? "Leave";
}

export function leaveTypeCountsTowardEntitlement(type?: string | null) {
  return (
    LEAVE_TYPES.find((item) => item.value === type)?.countsTowardEntitlement ??
    false
  );
}

export function getLeavePlanStatusLabel(status?: string | null) {
  return (
    LEAVE_PLAN_STATUSES.find((item) => item.value === status)?.label ?? "Draft"
  );
}

export function getLeaveSessionStatusLabel(status?: string | null) {
  return (
    LEAVE_SESSION_STATUSES.find((item) => item.value === status)?.label ??
    "Planned"
  );
}

export function isEditablePlanStatus(status?: string | null) {
  return status === "draft" || status === "changes_requested" || !status;
}
