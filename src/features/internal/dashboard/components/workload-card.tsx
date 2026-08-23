"use client";

import Link from "next/link";
import { FlaskConical, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLabSectionLabel } from "@/features/internal/labs/constants";
import { cn } from "@/lib/utils";
import type {
  LabWorkload,
  StaffWorkload,
} from "@/sanity/lib/dashboard/getSetupProgress";

const MAX_ROWS = 6;
const STAFF_LOAD_CAP = 5;

type WorkloadCardProps = {
  labs: LabWorkload[];
  staff: StaffWorkload[];
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function labUtilization(lab: LabWorkload): number | null {
  if (lab.capacity && lab.capacity > 0) {
    return lab.projectCount / lab.capacity;
  }
  if (lab.status === "fullCapacity") return 1;
  return null;
}

function isLabOverloaded(lab: LabWorkload) {
  if (lab.status === "fullCapacity") return true;
  const utilization = labUtilization(lab);
  return utilization !== null && utilization > 1;
}

function staffUtilization(person: StaffWorkload): number | null {
  const fromLabs = person.labs
    .map((lab) => labUtilization(lab))
    .filter((value): value is number => value !== null);
  if (fromLabs.length > 0) return Math.max(...fromLabs);
  if (person.projectCount <= 0) return 0;
  return person.projectCount / STAFF_LOAD_CAP;
}

function isStaffOverloaded(person: StaffWorkload) {
  return (
    person.labs.some(isLabOverloaded) || person.projectCount >= STAFF_LOAD_CAP
  );
}

function sortLabs(labs: LabWorkload[]) {
  return [...labs].sort((a, b) => {
    const aOver = isLabOverloaded(a) ? 1 : 0;
    const bOver = isLabOverloaded(b) ? 1 : 0;
    if (aOver !== bOver) return bOver - aOver;
    const aUtil = labUtilization(a) ?? -1;
    const bUtil = labUtilization(b) ?? -1;
    if (aUtil !== bUtil) return bUtil - aUtil;
    return b.projectCount - a.projectCount;
  });
}

function sortStaff(staff: StaffWorkload[]) {
  return [...staff].sort((a, b) => {
    const aOver = isStaffOverloaded(a) ? 1 : 0;
    const bOver = isStaffOverloaded(b) ? 1 : 0;
    if (aOver !== bOver) return bOver - aOver;
    const aUtil = staffUtilization(a) ?? -1;
    const bUtil = staffUtilization(b) ?? -1;
    if (aUtil !== bUtil) return bUtil - aUtil;
    return b.projectCount - a.projectCount;
  });
}

function LoadBar({
  value,
  overloaded,
}: {
  value: number;
  overloaded: boolean;
}) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          overloaded ? "bg-destructive" : "bg-primary"
        )}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

function OverloadBadge() {
  return (
    <Badge
      variant="outline"
      className="shrink-0 border-destructive/30 bg-destructive/10 font-normal text-destructive"
    >
      Overload
    </Badge>
  );
}

function EmptyState({
  icon: Icon,
  message,
  href,
  action,
}: {
  icon: typeof FlaskConical;
  message: string;
  href: string;
  action: string;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-8 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link
        href={href}
        prefetch
        className="mt-2 text-sm font-medium text-primary hover:underline"
      >
        {action}
      </Link>
    </div>
  );
}

export function WorkloadCard({ labs, staff }: WorkloadCardProps) {
  const labRows = sortLabs(labs).slice(0, MAX_ROWS);
  const staffRows = sortStaff(staff).slice(0, MAX_ROWS);
  const overloadedLabs = labs.filter(isLabOverloaded).length;
  const overloadedStaff = staff.filter(isStaffOverloaded).length;

  return (
    <div className="rounded-2xl border bg-gradient-to-b from-muted/20 to-muted/40 shadow-sm">
      <Tabs defaultValue="labs">
        <div className="px-4 pt-4">
          <h2 className="px-1 text-base font-semibold tracking-tight">
            Workload Distribution
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            {" "}
            Track the workload of your laboratories and staff.{" "}
          </p>
          <TabsList className="my-4 h-10">
            <TabsTrigger value="labs" className="gap-1.5 text-xs sm:text-sm">
              Laboratories
              {overloadedLabs > 0 ? (
                <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
                  {overloadedLabs}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-1.5 text-xs sm:text-sm">
              Staff
              {overloadedStaff > 0 ? (
                <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
                  {overloadedStaff}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="labs" className="my-5">
          {labRows.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              message="No laboratories registered yet."
              href="/labs/create"
              action="Register a laboratory"
            />
          ) : (
            <>
              <ul className="divide-y border-t">
                {labRows.map((lab) => {
                  const utilization = labUtilization(lab);
                  const overloaded = isLabOverloaded(lab);
                  const percent =
                    utilization === null ? null : Math.round(utilization * 100);

                  return (
                    <li key={lab._id}>
                      <Link
                        href={`/labs/${lab._id}`}
                        prefetch
                        className="block px-5 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {lab.name ?? "Untitled laboratory"}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {[
                                lab.internalId,
                                getLabSectionLabel(lab.labSection),
                                lab.capacity
                                  ? `${lab.projectCount} / ${pluralize(lab.capacity, "station")}`
                                  : pluralize(lab.projectCount, "project"),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          {overloaded ? (
                            <OverloadBadge />
                          ) : percent !== null ? (
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              {percent}%
                            </span>
                          ) : null}
                        </div>
                        {percent !== null ? (
                          <LoadBar value={percent} overloaded={overloaded} />
                        ) : (
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            Set workstation capacity to track overload.
                          </p>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t px-5 py-5">
                <Link
                  href="/labs"
                  prefetch
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all laboratories
                </Link>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="staff" className="my-5">
          {staffRows.length === 0 ? (
            <EmptyState
              icon={Users}
              message="No staff assigned to laboratories yet."
              href="/labs"
              action="Assign lab staff"
            />
          ) : (
            <>
              <ul className="divide-y border-t">
                {staffRows.map((person) => {
                  const utilization = staffUtilization(person);
                  const overloaded = isStaffOverloaded(person);
                  const percent =
                    utilization === null ? 0 : Math.round(utilization * 100);
                  const labNames = person.labs
                    .map((lab) => lab.name)
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <li key={person._id}>
                      <Link
                        href={
                          person.labs[0]
                            ? `/labs/${person.labs[0]._id}?tab=staffing`
                            : "/personnel"
                        }
                        prefetch
                        className="block px-5 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {person.fullName ?? "Unnamed staff"}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {[
                                pluralize(person.projectCount, "project"),
                                labNames ||
                                  pluralize(person.labs.length, "lab"),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          {overloaded ? <OverloadBadge /> : null}
                        </div>
                        <LoadBar value={percent} overloaded={overloaded} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t px-5 py-3">
                <Link
                  href="/personnel"
                  prefetch
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all personnel
                </Link>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
