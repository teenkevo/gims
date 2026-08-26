"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  CalendarPlus,
  Send,
  UserCheck,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Can } from "@/components/auth/can";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  DEFAULT_ANNUAL_ENTITLEMENT_DAYS,
  isEditablePlanStatus,
} from "../constants";
import { cancelLeaveSession, submitLeavePlan } from "../actions";
import type { LeavePlan, LeaveSession, LeaveStaffOption } from "../types";
import {
  getUsedEntitlementDays,
  isSessionHappeningNow,
  parseDateOnly,
  upcomingSessions,
} from "../utils";
import {
  LeavePlanStatusBadge,
  LeaveSessionStatusBadge,
  LeaveTypeBadge,
} from "./leave-badges";
import { LeaveSessionDialog } from "./leave-session-dialog";

function formatRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "Dates not set";
  return `${format(parseDateOnly(start), "d MMM")} – ${format(parseDateOnly(end), "d MMM yyyy")}`;
}

export function MyLeavePlan({
  year,
  plan,
  plans,
  staff,
  personnelId,
}: {
  year: number;
  plan: LeavePlan | null;
  plans: LeavePlan[];
  staff: LeaveStaffOption[];
  personnelId?: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveSession | null>(null);
  const [isPending, startTransition] = useTransition();

  const usedDays = plan ? getUsedEntitlementDays(plan) : 0;
  const entitlement = plan?.entitlementDays ?? DEFAULT_ANNUAL_ENTITLEMENT_DAYS;
  const remaining = Math.max(entitlement - usedDays, 0);
  const usagePercent = Math.min(100, Math.round((usedDays / Math.max(entitlement, 1)) * 100));
  const canEdit = !plan || isEditablePlanStatus(plan.status) || plan.status === "approved";
  const sessions = (plan?.sessions ?? []).filter((session) => session.status !== "cancelled");

  const covering = useMemo(() => {
    if (!personnelId) return [];
    return upcomingSessions(plans, personnelId).filter(
      (item) => item.session.relief?._id === personnelId && item.plan.employee?._id !== personnelId
    );
  }, [personnelId, plans]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(session: LeaveSession) {
    setEditing(session);
    setDialogOpen(true);
  }

  function handleSubmit() {
    if (!plan) return;
    startTransition(async () => {
      const result = await submitLeavePlan(plan._id);
      if (result.status === "error") {
        toast.error(result.error);
        return;
      }
      toast.success("Leave plan submitted for review");
      router.refresh();
    });
  }

  function handleCancel(session: LeaveSession) {
    if (!plan) return;
    startTransition(async () => {
      const result = await cancelLeaveSession({
        planId: plan._id,
        sessionKey: session._key,
      });
      if (result.status === "error") {
        toast.error(result.error);
        return;
      }
      toast.success("Leave session removed");
      router.refresh();
    });
  }

  if (!personnelId) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Your login is not linked to a personnel record, so a personal leave plan
          cannot be created. Ask HR to connect your profile.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="bg-gradient-to-b from-muted/20 to-muted/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight">
              {remaining}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                of {entitlement} days left
              </span>
            </p>
            <Progress value={usagePercent} className="mt-3" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-muted/20 to-muted/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <LeavePlanStatusBadge status={plan?.status ?? "draft"} />
            <p className="text-sm text-muted-foreground">{year}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-muted/20 to-muted/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              You are covering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight">{covering.length}</p>
            <p className="text-xs text-muted-foreground">upcoming colleague sessions</p>
          </CardContent>
        </Card>
      </div>

      {covering.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coverage you owe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {covering.map(({ plan: coveredPlan, session }) => (
              <div
                key={`${coveredPlan._id}-${session._key}`}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{coveredPlan.employee?.fullName}</p>
                  <p className="text-muted-foreground">
                    {formatRange(session.startDate, session.endDate)}
                  </p>
                </div>
                <LeaveTypeBadge type={session.type} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Leave sessions</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Each session must name a relief colleague. Annual leave uses working days only.
            </p>
          </div>
          <Can permission={PERMISSIONS["leave:create"]}>
            {canEdit ? (
              <Button size="sm" onClick={openCreate}>
                <CalendarPlus className="mr-2 size-4" />
                Add session
              </Button>
            ) : null}
          </Can>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center">
              <p className="font-medium">No leave planned for {year} yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first session and assign someone to cover your work.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const happening = isSessionHappeningNow(session);
              return (
                <div
                  key={session._key}
                  className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <LeaveTypeBadge type={session.type} />
                      <LeaveSessionStatusBadge status={session.status} />
                      {happening ? (
                        <span className="text-xs font-medium text-orange-600">
                          On leave now
                        </span>
                      ) : null}
                    </div>
                    <p className="font-medium">
                      {formatRange(session.startDate, session.endDate)}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <UserCheck className="size-3.5" />
                      Relief: {session.relief?.fullName ?? "Unassigned"}
                      {session.days ? ` · ${session.days} working days` : null}
                    </p>
                    {session.notes ? (
                      <p className="text-sm text-muted-foreground">{session.notes}</p>
                    ) : null}
                  </div>
                  {canEdit && session.status !== "approved" ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(session)}
                        disabled={isPending}
                      >
                        <Pencil className="mr-1.5 size-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleCancel(session)}
                        disabled={isPending}
                      >
                        <Trash2 className="mr-1.5 size-3.5" />
                        Remove
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}

          {plan && isEditablePlanStatus(plan.status) && sessions.length > 0 ? (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSubmit} disabled={isPending}>
                <Send className="mr-2 size-4" />
                Submit plan for approval
              </Button>
            </div>
          ) : null}

          {plan?.status === "changes_requested" && plan.reviewNote ? (
            <p className="rounded-md bg-orange-500/10 px-3 py-2 text-sm text-orange-700 dark:text-orange-400">
              HR requested changes: {plan.reviewNote}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {dialogOpen ? (
        <LeaveSessionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          year={year}
          plan={plan}
          session={editing}
          staff={staff}
          plans={plans}
          employeeId={personnelId}
        />
      ) : null}
    </div>
  );
}
