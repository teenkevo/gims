import {
  leaveTypeCountsTowardEntitlement,
  type LeaveSessionStatus,
} from "./constants";
import type { LeavePlan, LeaveSession } from "./types";

export function toDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function countWorkingDays(startDate: string, endDate: string) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }

  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  return startA <= endB && startB <= endA;
}

export function isActiveSession(session: Pick<LeaveSession, "status">) {
  return session.status !== "cancelled";
}

export function getActiveSessions(plan: LeavePlan) {
  return (plan.sessions ?? []).filter(isActiveSession);
}

export function getUsedEntitlementDays(plan: LeavePlan) {
  return getActiveSessions(plan)
    .filter((session) => leaveTypeCountsTowardEntitlement(session.type))
    .reduce((sum, session) => {
      if (session.startDate && session.endDate) {
        return sum + (session.days ?? countWorkingDays(session.startDate, session.endDate));
      }
      return sum;
    }, 0);
}

export function isSessionHappeningNow(session: LeaveSession, today = toDateOnly(new Date())) {
  if (!isActiveSession(session) || !session.startDate || !session.endDate) {
    return false;
  }
  if (session.status === "planned" || session.status === "pending") {
    return false;
  }
  return session.startDate <= today && session.endDate >= today;
}

export function findSessionOverlap(
  sessions: LeaveSession[],
  startDate: string,
  endDate: string,
  ignoreKey?: string
) {
  return sessions.find(
    (session) =>
      isActiveSession(session) &&
      session._key !== ignoreKey &&
      session.startDate &&
      session.endDate &&
      datesOverlap(startDate, endDate, session.startDate, session.endDate)
  );
}

export function getReliefConflict(
  plans: LeavePlan[],
  reliefId: string,
  startDate: string,
  endDate: string,
  options?: { ignorePlanId?: string; ignoreSessionKey?: string }
): string | null {
  for (const plan of plans) {
    for (const session of getActiveSessions(plan)) {
      if (
        plan._id === options?.ignorePlanId &&
        session._key === options?.ignoreSessionKey
      ) {
        continue;
      }
      if (!session.startDate || !session.endDate) continue;
      if (!datesOverlap(startDate, endDate, session.startDate, session.endDate)) {
        continue;
      }

      if (plan.employee?._id === reliefId) {
        return `${plan.employee.fullName ?? "This person"} is already on leave for part of those dates.`;
      }

      if (session.relief?._id === reliefId) {
        const colleague = plan.employee?.fullName ?? "a colleague";
        return `${session.relief.fullName ?? "This person"} is already covering ${colleague} on overlapping dates.`;
      }
    }
  }

  return null;
}

export function upcomingSessions(plans: LeavePlan[], personnelId: string, today = toDateOnly(new Date())) {
  return plans.flatMap((plan) =>
    getActiveSessions(plan)
      .filter(
        (session) =>
          session.endDate &&
          session.endDate >= today &&
          (plan.employee?._id === personnelId || session.relief?._id === personnelId)
      )
      .map((session) => ({ plan, session }))
  );
}

export function currentCoverage(plans: LeavePlan[], today = toDateOnly(new Date())) {
  return plans.flatMap((plan) =>
    getActiveSessions(plan)
      .filter((session) => isSessionHappeningNow(session, today))
      .map((session) => ({ plan, session }))
  );
}

export function defaultSessionStatus(
  planStatus: LeavePlan["status"]
): LeaveSessionStatus {
  return planStatus === "approved" ? "pending" : "planned";
}
