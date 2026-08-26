"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { Check, MessageSquareWarning, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { approveLeaveSession, reviewLeavePlan } from "../actions";
import type { LeavePlan } from "../types";
import {
  currentCoverage,
  getUsedEntitlementDays,
  parseDateOnly,
} from "../utils";
import {
  LeavePlanStatusBadge,
  LeaveSessionStatusBadge,
  LeaveTypeBadge,
} from "./leave-badges";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function formatRange(start?: string | null, end?: string | null) {
  if (!start || !end) return "—";
  return `${format(parseDateOnly(start), "d MMM")} – ${format(parseDateOnly(end), "d MMM")}`;
}

export function TeamLeavePlans({
  year,
  plans,
  canApprove,
}: {
  year: number;
  plans: LeavePlan[];
  canApprove: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LeavePlan | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const yearPlans = plans.filter((plan) => plan.year === year);
  const onLeaveToday = currentCoverage(yearPlans);
  const pendingReview = yearPlans.filter((plan) => plan.status === "submitted");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return yearPlans;
    return yearPlans.filter((plan) => {
      const name = plan.employee?.fullName?.toLowerCase() ?? "";
      const department = plan.employee?.department?.toLowerCase() ?? "";
      return name.includes(needle) || department.includes(needle);
    });
  }, [query, yearPlans]);

  function decide(decision: "approved" | "changes_requested") {
    if (!selected) return;
    startTransition(async () => {
      const result = await reviewLeavePlan({
        planId: selected._id,
        decision,
        note,
      });
      if (result.status === "error") {
        toast.error(result.error);
        return;
      }
      toast.success(
        decision === "approved" ? "Leave plan approved" : "Changes requested"
      );
      setSelected(null);
      setNote("");
      router.refresh();
    });
  }

  function approveSession(planId: string, sessionKey: string) {
    startTransition(async () => {
      const result = await approveLeaveSession({ planId, sessionKey });
      if (result.status === "error") {
        toast.error(result.error);
        return;
      }
      toast.success("Session approved");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="bg-gradient-to-b from-muted/20 to-muted/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awaiting review
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tracking-tight">
            {pendingReview.length}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-muted/20 to-muted/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On leave today
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tracking-tight">
            {onLeaveToday.length}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-b from-muted/20 to-muted/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plans this year
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold tracking-tight">
            {yearPlans.length}
          </CardContent>
        </Card>
      </div>

      {onLeaveToday.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Out today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {onLeaveToday.map(({ plan, session }) => (
              <div
                key={`${plan._id}-${session._key}`}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{plan.employee?.fullName}</p>
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <UserCheck className="size-3.5" />
                    Covered by {session.relief?.fullName ?? "unassigned"}
                  </p>
                </div>
                <LeaveTypeBadge type={session.type} />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or department..."
          className="h-8 max-w-sm"
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Annual used</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No leave plans for {year}.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((plan) => {
                  const used = getUsedEntitlementDays(plan);
                  const entitlement = plan.entitlementDays ?? 21;
                  return (
                    <TableRow key={plan._id}>
                      <TableCell className="font-medium">
                        {plan.employee?.fullName ?? "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {plan.employee?.department ?? "—"}
                      </TableCell>
                      <TableCell>
                        <LeavePlanStatusBadge status={plan.status} />
                      </TableCell>
                      <TableCell>
                        {used}/{entitlement}
                      </TableCell>
                      <TableCell>
                        {(plan.sessions ?? []).filter((session) => session.status !== "cancelled").length}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelected(plan);
                            setNote(plan.reviewNote ?? "");
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selected?.employee?.fullName}</DialogTitle>
            <DialogDescription>
              {year} leave plan · {selected?.employee?.department ?? "No department"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(selected?.sessions ?? [])
              .filter((session) => session.status !== "cancelled")
              .map((session) => (
                <div key={session._key} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <LeaveTypeBadge type={session.type} />
                    <LeaveSessionStatusBadge status={session.status} />
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    {formatRange(session.startDate, session.endDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Relief: {session.relief?.fullName ?? "Unassigned"}
                    {session.days ? ` · ${session.days} working days` : ""}
                  </p>
                  {canApprove && session.status === "pending" ? (
                    <Button
                      className="mt-2"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        selected && approveSession(selected._id, session._key)
                      }
                    >
                      <Check className="mr-1.5 size-3.5" />
                      Approve session
                    </Button>
                  ) : null}
                </div>
              ))}
            {canApprove ? (
              <div className="space-y-2">
                <Label>Review note</Label>
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Optional note to the employee"
                  rows={3}
                />
              </div>
            ) : null}
          </div>
          {canApprove ? (
            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => decide("changes_requested")}
              >
                <MessageSquareWarning className="mr-2 size-4" />
                Request changes
              </Button>
              <Button disabled={isPending} onClick={() => decide("approved")}>
                <Check className="mr-2 size-4" />
                Approve plan
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
