"use client";

import { CircleAlert } from "lucide-react";
import { format } from "date-fns";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getDueInstant, getOverdueDuration } from "@/lib/project-due";

export function OverdueIndicator({ endDate }: { endDate: string }) {
  const duration = getOverdueDuration(endDate);
  const dueDate = getDueInstant(endDate);

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label="Overdue details"
          className="inline-flex size-6 items-center justify-center rounded-full text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/40"
          onClick={(event) => event.stopPropagation()}
        >
          <CircleAlert className="size-4" strokeWidth={2.5} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-64 overflow-hidden rounded-xl border-destructive/20 p-0 shadow-lg"
      >
        <div className="flex items-center gap-2 bg-destructive/10 px-3.5 py-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <CircleAlert className="size-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-sm font-semibold text-destructive">Overdue</p>
            <p className="text-[11px] text-destructive/80">
              This project has passed its end date
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 px-3.5 py-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Due date
            </p>
            <p className="mt-1 text-sm font-medium">
              {dueDate ? format(dueDate, "d MMM yyyy") : "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Behind by
            </p>
            <p className="mt-1 text-sm font-semibold text-destructive">
              {duration
                ? `${duration.value} ${duration.unit}`
                : "Just now"}
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
