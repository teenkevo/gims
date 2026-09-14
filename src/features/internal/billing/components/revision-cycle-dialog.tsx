"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  GitPullRequest,
  History,
  User,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export type RevisionCycleEvent = {
  type: string;
  at?: string | null;
  notes?: string | null;
  actorName?: string | null;
  actorType?: string | null;
};

function eventCopy(type: string) {
  switch (type) {
    case "revisions_requested":
      return {
        title: "Client requested revisions",
        icon: GitPullRequest,
        iconClassName: "text-amber-500",
        dotClassName: "bg-amber-500",
      };
    case "revisions_declined":
      return {
        title: "GETLAB declined the request",
        icon: XCircle,
        iconClassName: "text-destructive",
        dotClassName: "bg-destructive",
      };
    case "revised":
      return {
        title: "GETLAB issued a revised quotation",
        icon: CheckCircle2,
        iconClassName: "text-primary",
        dotClassName: "bg-primary",
      };
    default:
      return {
        title: type,
        icon: History,
        iconClassName: "text-muted-foreground",
        dotClassName: "bg-muted-foreground",
      };
  }
}

function formatEventTime(at?: string | null) {
  if (!at) return null;
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "MMM d, yyyy, h:mma");
}

function actorLabel(event: RevisionCycleEvent) {
  if (event.actorName) return event.actorName;
  if (event.actorType === "client") return "Client";
  if (event.actorType === "personnel") return "GETLAB";
  return null;
}

export function RevisionCycleDialog({
  events,
}: {
  events: RevisionCycleEvent[];
}) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [open, setOpen] = useState(false);

  const timeline = (
    <ol className="relative ml-2 space-y-6 border-l border-muted-foreground/20 pl-6">
      {events.map((event, index) => {
        const copy = eventCopy(event.type);
        const Icon = copy.icon;
        const time = formatEventTime(event.at);
        const actor = actorLabel(event);

        return (
          <li key={`${event.type}-${event.at ?? index}`} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                copy.dotClassName
              )}
            />
            <div className="flex items-start gap-2">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", copy.iconClassName)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{copy.title}</p>
                {(time || actor) && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    {time && <span>{time}</span>}
                    {actor && (
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {actor}
                      </span>
                    )}
                  </p>
                )}
                {event.notes?.trim() && (
                  <div className="mt-2 rounded-lg border bg-muted/50 p-3">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {event.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );

  const trigger = (
    <Button variant="outline" size="sm">
      <History className="mr-2 h-4 w-4" />
      Revision history
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Revision history</DrawerTitle>
            <DrawerDescription>
              Events during this quotation revision cycle.
            </DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[60vh] overflow-y-auto px-4 pb-2">{timeline}</div>
          <DrawerFooter className="pt-2">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Revision history</DialogTitle>
          <DialogDescription>
            Events during this quotation revision cycle.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto py-2">{timeline}</div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
