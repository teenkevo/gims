"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { writeClient } from "@/sanity/lib/write-client";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createAuditLog } from "@/lib/auth/audit-log";
import type { AuthContext } from "@/lib/auth/types";
import { getLeavePlans } from "@/sanity/lib/leave/getLeavePlans";
import {
  DEFAULT_ANNUAL_ENTITLEMENT_DAYS,
  isEditablePlanStatus,
  leaveTypeCountsTowardEntitlement,
  type LeavePlanStatus,
  type LeaveSessionStatus,
} from "./constants";
import type { LeavePlan, LeaveSessionInput } from "./types";
import {
  countWorkingDays,
  defaultSessionStatus,
  findSessionOverlap,
  getReliefConflict,
  getUsedEntitlementDays,
} from "./utils";

type ActionResult = { status: "ok" } | { status: "error"; error: string };

function ok(): ActionResult {
  return { status: "ok" };
}

function fail(error: string): ActionResult {
  return { status: "error", error };
}

function canManage(session: AuthContext) {
  return (
    session.permissions.includes(PERMISSIONS["leave:update"]) ||
    session.permissions.includes(PERMISSIONS["leave:approve"])
  );
}

function isOwner(plan: LeavePlan, session: AuthContext) {
  return Boolean(session.personnelId && plan.employee?._id === session.personnelId);
}

function toSessionPatch(input: LeaveSessionInput, status: LeaveSessionStatus) {
  return {
    _key: input.key ?? uuidv4(),
    _type: "leaveSession",
    type: input.type,
    startDate: input.startDate,
    endDate: input.endDate,
    days: countWorkingDays(input.startDate, input.endDate),
    notes: input.notes?.trim() || undefined,
    status,
    relief: {
      _type: "reference" as const,
      _ref: input.reliefId,
    },
  };
}

function toStoredSessions(plan: LeavePlan) {
  return (plan.sessions ?? []).map((session) => ({
    _key: session._key,
    _type: "leaveSession",
    type: session.type,
    startDate: session.startDate,
    endDate: session.endDate,
    days: session.days,
    notes: session.notes,
    status: session.status,
    relief: session.relief?._id
      ? { _type: "reference" as const, _ref: session.relief._id }
      : undefined,
  }));
}

async function loadPlan(planId: string, year?: number) {
  const currentYear = year ?? new Date().getFullYear();
  const plans = await getLeavePlans([currentYear - 1, currentYear, currentYear + 1]);
  return {
    plan: plans.find((item) => item._id === planId) ?? null,
    plans,
  };
}

function validateSession(input: LeaveSessionInput, employeeId: string) {
  if (!input.type || !input.startDate || !input.endDate || !input.reliefId) {
    return "Type, dates, and a relief person are required.";
  }
  if (input.endDate < input.startDate) {
    return "The end date must be on or after the start date.";
  }
  if (countWorkingDays(input.startDate, input.endDate) < 1) {
    return "Leave must include at least one working day (Monday–Friday).";
  }
  if (input.reliefId === employeeId) {
    return "You cannot be your own relief. Choose a colleague.";
  }
  return null;
}

function entitlementError(plan: LeavePlan, incoming: LeaveSessionInput) {
  if (!leaveTypeCountsTowardEntitlement(incoming.type)) return null;

  const preview: LeavePlan = {
    ...plan,
    sessions: [
      ...(plan.sessions ?? []).filter((session) => session._key !== incoming.key),
      {
        _key: incoming.key ?? "preview",
        type: incoming.type,
        startDate: incoming.startDate,
        endDate: incoming.endDate,
        days: countWorkingDays(incoming.startDate, incoming.endDate),
        notes: incoming.notes ?? null,
        status: "planned",
        relief: { _id: incoming.reliefId, fullName: null, status: null },
      },
    ],
  };

  const used = getUsedEntitlementDays(preview);
  const entitlement = plan.entitlementDays ?? DEFAULT_ANNUAL_ENTITLEMENT_DAYS;
  if (used > entitlement) {
    return `Annual leave would be ${used} working days, above the ${entitlement}-day entitlement.`;
  }
  return null;
}

async function refreshLeave() {
  revalidateTag("leavePlan");
  revalidatePath("/leave");
}

export async function saveLeaveSession(input: {
  planId?: string;
  year: number;
  employeeId?: string;
  session: LeaveSessionInput;
}): Promise<ActionResult> {
  const auth = await requirePermission(PERMISSIONS["leave:create"]);

  try {
    const employeeId = input.employeeId ?? auth.personnelId;
    if (!employeeId) {
      return fail("Your account is not linked to a personnel record.");
    }
    if (employeeId !== auth.personnelId && !canManage(auth)) {
      return fail("You can only add leave to your own plan.");
    }

    const inputError = validateSession(input.session, employeeId);
    if (inputError) return fail(inputError);

    const plans = await getLeavePlans([input.year]);
    const existing =
      plans.find((plan) => plan._id === input.planId) ??
      plans.find((plan) => plan.employee?._id === employeeId) ??
      null;

    if (existing) {
      const owner = isOwner(existing, auth);
      const allowed =
        canManage(auth) ||
        (owner &&
          (isEditablePlanStatus(existing.status) || existing.status === "approved"));
      if (!allowed) {
        return fail("This plan is locked until HR requests changes.");
      }
    }

    const overlap = findSessionOverlap(
      existing?.sessions ?? [],
      input.session.startDate,
      input.session.endDate,
      input.session.key
    );
    if (overlap) {
      return fail("This overlaps another leave session in the same plan.");
    }

    const reliefConflict = getReliefConflict(
      plans,
      input.session.reliefId,
      input.session.startDate,
      input.session.endDate,
      { ignorePlanId: existing?._id, ignoreSessionKey: input.session.key }
    );
    if (reliefConflict) return fail(reliefConflict);

    if (existing) {
      const over = entitlementError(existing, input.session);
      if (over) return fail(over);

      const next = toSessionPatch(
        input.session,
        existing.sessions?.some((session) => session._key === input.session.key)
          ? ((existing.sessions.find((session) => session._key === input.session.key)
              ?.status as LeaveSessionStatus) ?? defaultSessionStatus(existing.status))
          : defaultSessionStatus(existing.status)
      );

      const sessions = [
        ...toStoredSessions(existing).filter((session) => session._key !== next._key),
        next,
      ];

      await writeClient.patch(existing._id).set({ sessions }).commit();
    } else {
      await writeClient.create({
        _type: "leavePlan",
        employee: { _type: "reference", _ref: employeeId },
        year: input.year,
        entitlementDays: DEFAULT_ANNUAL_ENTITLEMENT_DAYS,
        status: "draft" satisfies LeavePlanStatus,
        sessions: [toSessionPatch(input.session, "planned")],
      });
    }

    await createAuditLog(auth, {
      action: existing ? "update" : "create",
      resource: "leavePlan",
      resourceId: existing?._id,
      metadata: { year: input.year, employeeId },
    });
    await refreshLeave();
    return ok();
  } catch (error) {
    console.error("saveLeaveSession failed", error);
    return fail("Could not save the leave session.");
  }
}

export async function cancelLeaveSession(input: {
  planId: string;
  sessionKey: string;
}): Promise<ActionResult> {
  const auth = await requirePermission(PERMISSIONS["leave:create"]);

  try {
    const { plan } = await loadPlan(input.planId);
    if (!plan) return fail("Leave plan not found.");
    if (!isOwner(plan, auth) && !canManage(auth)) {
      return fail("You cannot change this session.");
    }

    const session = plan.sessions?.find((item) => item._key === input.sessionKey);
    if (!session) return fail("Leave session not found.");

    const removable = session.status === "planned" || session.status === "pending";
    if (removable) {
      await writeClient
        .patch(plan._id)
        .unset([`sessions[_key=="${input.sessionKey}"]`])
        .commit();
    } else {
      await writeClient
        .patch(plan._id)
        .set({ [`sessions[_key=="${input.sessionKey}"].status`]: "cancelled" })
        .commit();
    }

    await createAuditLog(auth, {
      action: "update",
      resource: "leavePlan",
      resourceId: plan._id,
      metadata: { event: "session_cancelled", sessionKey: input.sessionKey },
    });
    await refreshLeave();
    return ok();
  } catch (error) {
    console.error("cancelLeaveSession failed", error);
    return fail("Could not update that leave session.");
  }
}

export async function submitLeavePlan(planId: string): Promise<ActionResult> {
  const auth = await requirePermission(PERMISSIONS["leave:create"]);

  try {
    const { plan } = await loadPlan(planId);
    if (!plan) return fail("Leave plan not found.");
    if (!isOwner(plan, auth) && !canManage(auth)) {
      return fail("You can only submit your own plan.");
    }
    if (!isEditablePlanStatus(plan.status)) {
      return fail("This plan has already been submitted.");
    }

    const sessions = (plan.sessions ?? []).filter(
      (session) => session.status !== "cancelled"
    );
    if (sessions.length === 0) {
      return fail("Add at least one leave session before submitting.");
    }
    if (sessions.some((session) => !session.relief?._id)) {
      return fail("Every session needs a relief person.");
    }

    const used = getUsedEntitlementDays(plan);
    const entitlement = plan.entitlementDays ?? DEFAULT_ANNUAL_ENTITLEMENT_DAYS;
    if (used > entitlement) {
      return fail(
        `Annual leave is ${used} working days, above the ${entitlement}-day entitlement.`
      );
    }

    await writeClient
      .patch(plan._id)
      .set({
        status: "submitted" satisfies LeavePlanStatus,
        submittedAt: new Date().toISOString(),
        reviewNote: null,
      })
      .commit();

    await createAuditLog(auth, {
      action: "update",
      resource: "leavePlan",
      resourceId: plan._id,
      metadata: { event: "submitted" },
    });
    await refreshLeave();
    return ok();
  } catch (error) {
    console.error("submitLeavePlan failed", error);
    return fail("Could not submit the leave plan.");
  }
}

export async function reviewLeavePlan(input: {
  planId: string;
  decision: "approved" | "changes_requested";
  note?: string;
}): Promise<ActionResult> {
  const auth = await requirePermission(PERMISSIONS["leave:approve"]);

  try {
    const { plan } = await loadPlan(input.planId);
    if (!plan) return fail("Leave plan not found.");

    const sessions =
      input.decision === "approved"
        ? toStoredSessions({
            ...plan,
            sessions: (plan.sessions ?? []).map((session) =>
              session.status === "cancelled"
                ? session
                : { ...session, status: "approved" }
            ),
          })
        : undefined;

    await writeClient
      .patch(plan._id)
      .set({
        status: input.decision,
        reviewedAt: new Date().toISOString(),
        reviewNote: input.note?.trim() || null,
        ...(auth.personnelId
          ? {
              reviewedBy: {
                _type: "reference",
                _ref: auth.personnelId,
              },
            }
          : {}),
        ...(sessions ? { sessions } : {}),
      })
      .commit();

    await createAuditLog(auth, {
      action: "update",
      resource: "leavePlan",
      resourceId: plan._id,
      metadata: { event: input.decision },
    });
    await refreshLeave();
    return ok();
  } catch (error) {
    console.error("reviewLeavePlan failed", error);
    return fail("Could not review the leave plan.");
  }
}

export async function approveLeaveSession(input: {
  planId: string;
  sessionKey: string;
}): Promise<ActionResult> {
  const auth = await requirePermission(PERMISSIONS["leave:approve"]);

  try {
    const { plan } = await loadPlan(input.planId);
    if (!plan) return fail("Leave plan not found.");

    await writeClient
      .patch(plan._id)
      .set({ [`sessions[_key=="${input.sessionKey}"].status`]: "approved" })
      .commit();

    await createAuditLog(auth, {
      action: "update",
      resource: "leavePlan",
      resourceId: plan._id,
      metadata: { event: "session_approved", sessionKey: input.sessionKey },
    });
    await refreshLeave();
    return ok();
  } catch (error) {
    console.error("approveLeaveSession failed", error);
    return fail("Could not approve that session.");
  }
}

export async function deleteLeavePlan(planId: string): Promise<ActionResult> {
  const auth = await requirePermission(PERMISSIONS["leave:delete"]);

  try {
    const { plan } = await loadPlan(planId);
    if (!plan) return fail("Leave plan not found.");
    if (plan.status === "approved") {
      return fail("Approved plans cannot be deleted. Cancel sessions instead.");
    }

    await writeClient.delete(planId);
    await createAuditLog(auth, {
      action: "delete",
      resource: "leavePlan",
      resourceId: planId,
    });
    await refreshLeave();
    return ok();
  } catch (error) {
    console.error("deleteLeavePlan failed", error);
    return fail("Could not delete the leave plan.");
  }
}
