"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { saveLeaveSession } from "../actions";
import { LEAVE_TYPES, type LeaveType } from "../constants";
import type { LeavePlan, LeaveSession, LeaveSessionInput, LeaveStaffOption } from "../types";
import {
  countWorkingDays,
  getReliefConflict,
  parseDateOnly,
  toDateOnly,
} from "../utils";
import { PersonnelCombobox } from "./personnel-combobox";

function dateFromIso(value?: string | null) {
  return value ? parseDateOnly(value) : undefined;
}

export function LeaveSessionDialog({
  open,
  onOpenChange,
  year,
  plan,
  session,
  staff,
  plans,
  employeeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  plan?: LeavePlan | null;
  session?: LeaveSession | null;
  staff: LeaveStaffOption[];
  plans: LeavePlan[];
  employeeId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<LeaveType>(session?.type ?? "annual");
  const [reliefId, setReliefId] = useState(session?.relief?._id ?? "");
  const [notes, setNotes] = useState(session?.notes ?? "");
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const from = dateFromIso(session?.startDate);
    const to = dateFromIso(session?.endDate);
    return from ? { from, to: to ?? from } : undefined;
  });

  const startDate = range?.from ? toDateOnly(range.from) : "";
  const endDate = range?.to
    ? toDateOnly(range.to)
    : range?.from
      ? toDateOnly(range.from)
      : "";
  const workingDays =
    startDate && endDate ? countWorkingDays(startDate, endDate) : 0;

  const reliefReason = useMemo(() => {
    if (!startDate || !endDate) return () => null;
    return (person: LeaveStaffOption) =>
      getReliefConflict(plans, person._id, startDate, endDate, {
        ignorePlanId: plan?._id,
        ignoreSessionKey: session?._key,
      });
  }, [endDate, plan?._id, plans, session?._key, startDate]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!startDate || !endDate || !reliefId) {
      toast.error("Choose dates and a relief person.");
      return;
    }

    const payload: LeaveSessionInput = {
      key: session?._key,
      type,
      startDate,
      endDate,
      reliefId,
      notes,
    };

    startTransition(async () => {
      const result = await saveLeaveSession({
        planId: plan?._id,
        year,
        employeeId,
        session: payload,
      });
      if (result.status === "error") {
        toast.error(result.error);
        return;
      }
      toast.success(session ? "Leave session updated" : "Leave session added");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{session ? "Edit leave session" : "Add leave session"}</DialogTitle>
          <DialogDescription>
            Every session needs a colleague who will cover your work while you are away.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Leave type</Label>
            <Select value={type} onValueChange={(value) => setType(value as LeaveType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                    {item.countsTowardEntitlement ? " · counts to annual balance" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start font-normal",
                    !range?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {range?.from ? (
                    range.to ? (
                      `${format(range.from, "d MMM yyyy")} – ${format(range.to, "d MMM yyyy")}`
                    ) : (
                      format(range.from, "d MMM yyyy")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={1}
                  defaultMonth={range?.from}
                  disabled={{
                    before: new Date(year, 0, 1),
                    after: new Date(year, 11, 31),
                  }}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              {workingDays > 0
                ? `${workingDays} working day${workingDays === 1 ? "" : "s"} (weekends excluded)`
                : "Weekends are not counted against annual leave."}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Relief person</Label>
            <PersonnelCombobox
              people={staff}
              value={reliefId}
              onChange={setReliefId}
              excludeId={employeeId}
              disabledReason={reliefReason}
              placeholder="Who covers this session?"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Handover notes for the relief person"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
