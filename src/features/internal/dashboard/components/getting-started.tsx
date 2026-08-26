"use client";

import * as React from "react";
import Link from "next/link";
import {
  Beaker,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  FileStack,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SetupProgress } from "@/sanity/lib/dashboard/getSetupProgress";

type GettingStartedProps = {
  progress: SetupProgress;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function ProgressRing({ value }: { value: number }) {
  const size = 28;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-muted-foreground/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary"
      />
    </svg>
  );
}

function StatusIcon({
  complete,
  icon: Icon,
}: {
  complete: boolean;
  icon: LucideIcon;
}) {
  if (complete) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-5" strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary">
      <Icon className="size-5" />
    </span>
  );
}

function NestedStatus({ complete }: { complete: boolean }) {
  if (complete) {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }

  return (
    <span className="size-5 shrink-0 rounded-full border-[1.5px] border-dashed border-muted-foreground/40" />
  );
}

function TaskLink({
  href,
  complete,
  icon,
  title,
  description,
}: {
  href: string;
  complete: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      prefetch
      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
    >
      <StatusIcon complete={complete} icon={icon} />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-semibold",
            complete && "text-muted-foreground line-through"
          )}
        >
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      {!complete && (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

export function GettingStarted({ progress }: GettingStartedProps) {
  const clientsDone = progress.clients > 0;
  const projectDone = progress.projects > 0;
  const standardsDone = progress.standards > 0;
  const testMethodsDone = progress.testMethods > 0;
  const sampleClassesDone = progress.sampleClasses > 0;
  const masterDataDone = standardsDone && testMethodsDone && sampleClassesDone;

  const completedCount = [
    clientsDone,
    projectDone,
    standardsDone,
    testMethodsDone,
    sampleClassesDone,
  ].filter(Boolean).length;
  const percent = Math.round((completedCount / 5) * 100);
  const allDone = percent === 100;

  const [open, setOpen] = React.useState(!allDone);
  const [masterOpen, setMasterOpen] = React.useState(!masterDataDone);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-muted/20 to-muted/40 shadow-sm">
        <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Getting Started
            </h2>
          </div>
          <span className="flex items-center gap-2">
            {!open && (
              <span className="text-xs font-medium text-muted-foreground">
                {percent}%
              </span>
            )}
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-2 px-3 pb-3">
            <TaskLink
              href={projectDone ? "/projects" : "/projects/create?from=dashboard"}
              complete={projectDone}
              icon={FileStack}
              title={
                projectDone ? "Project created" : "Create your first project"
              }
              description={
                projectDone
                  ? `${pluralize(progress.projects, "project")} in progress`
                  : "Start a job and attach clients, samples, and reports."
              }
            />

            <TaskLink
              href={clientsDone ? "/clients" : "/clients/create"}
              complete={clientsDone}
              icon={Briefcase}
              title={clientsDone ? "Clients added" : "Add your first client"}
              description={
                clientsDone
                  ? `${pluralize(progress.clients, "client")} in GIMS`
                  : "Record who you deliver investigations for."
              }
            />

            <Collapsible open={masterOpen} onOpenChange={setMasterOpen}>
              <div className="rounded-xl">
                <CollapsibleTrigger className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-muted/50">
                  <StatusIcon complete={masterDataDone} icon={Database} />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm font-semibold",
                        masterDataDone && "text-muted-foreground line-through"
                      )}
                    >
                      {masterDataDone
                        ? "Master data configured"
                        : "Set up master data"}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Define standards, test methods, and sample classes.
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
                      masterOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mx-3 mb-2 overflow-hidden rounded-lg border bg-background">
                    <NestedTask
                      href="/master-data/standards"
                      complete={standardsDone}
                      icon={BookOpen}
                      title={
                        standardsDone ? "Standards added" : "Create a standard"
                      }
                      detail={
                        standardsDone
                          ? pluralize(progress.standards, "standard")
                          : "Testing standards used in the lab"
                      }
                    />
                    <NestedTask
                      href="/master-data/test-methods"
                      complete={testMethodsDone}
                      icon={Beaker}
                      title={
                        testMethodsDone
                          ? "Test methods added"
                          : "Add a test method"
                      }
                      detail={
                        testMethodsDone
                          ? pluralize(progress.testMethods, "test method")
                          : "Procedures tied to a standard"
                      }
                    />
                    <NestedTask
                      href="/master-data/sample-classes"
                      complete={sampleClassesDone}
                      icon={FlaskConical}
                      title={
                        sampleClassesDone
                          ? "Sample classes added"
                          : "Add a sample class"
                      }
                      detail={
                        sampleClassesDone
                          ? pluralize(
                              progress.sampleClasses,
                              "sample class",
                              "sample classes"
                            )
                          : "Material categories for testing"
                      }
                      last
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-center justify-between rounded-full bg-muted/70 px-4 py-2">
              <p className="text-sm font-medium text-muted-foreground">
                Getting Started: {percent}%
              </p>
              <ProgressRing value={percent} />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function NestedTask({
  href,
  complete,
  icon: Icon,
  title,
  detail,
  last = false,
}: {
  href: string;
  complete: boolean;
  icon: LucideIcon;
  title: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/70",
        !last && "border-b"
      )}
    >
      <NestedStatus complete={complete} />
      <Icon
        className={cn(
          "size-3.5 shrink-0",
          complete ? "text-muted-foreground/60" : "text-muted-foreground"
        )}
      />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm",
            complete
              ? "text-muted-foreground line-through"
              : "font-medium"
          )}
        >
          {title}
        </span>
        <span className="block text-[11px] text-muted-foreground">
          {detail}
        </span>
      </span>
      {!complete && (
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}
