"use client";

import * as React from "react";
import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/can";
import { PERMISSIONS } from "@/lib/auth/permissions";

function greetingName(firstName: string | null, fullName: string) {
  return firstName?.trim() || fullName.split(" ")[0] || "there";
}

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Hello";
}

export function DashboardHeader({
  firstName,
  fullName,
  variant = "internal",
}: {
  firstName: string | null;
  fullName: string;
  variant?: "internal" | "client";
}) {
  const name = greetingName(firstName, fullName);
  const [greeting, setGreeting] = React.useState("Welcome back");

  React.useEffect(() => {
    setGreeting(timeOfDayGreeting());
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-lg">
          {greeting}, {name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening across your workspace in GIMS.
        </p>
      </div>
      {variant === "internal" ? (
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/projects">View projects</Link>
          </Button>
          <Can permission={PERMISSIONS["projects:create"]}>
            <Button asChild>
              <Link
                href="/projects/create?from=dashboard"
                className="flex items-center"
              >
                <PlusCircleIcon className="h-5 w-5 md:mr-2" />
                <span className="hidden sm:inline">Create project</span>
              </Link>
            </Button>
          </Can>
        </div>
      ) : (
        <Button asChild variant="outline">
          <Link href="/projects">View projects</Link>
        </Button>
      )}
    </div>
  );
}
