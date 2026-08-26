"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { LeavePlan, LeaveStaffOption } from "../types";
import { MyLeavePlan } from "./my-leave-plan";
import { TeamLeavePlans } from "./team-leave-plans";

export function LeaveView({
  year: initialYear,
  plans,
  staff,
  personnelId,
}: {
  year: number;
  plans: LeavePlan[];
  staff: LeaveStaffOption[];
  personnelId?: string;
}) {
  const { can } = useRBAC();
  const [year, setYear] = useState(initialYear);
  const canReview =
    can(PERMISSIONS["leave:approve"]) || can(PERMISSIONS["leave:update"]);

  const years = [initialYear - 1, initialYear, initialYear + 1];
  const yearPlans = useMemo(
    () => plans.filter((plan) => plan.year === year),
    [plans, year]
  );
  const myPlan =
    yearPlans.find((plan) => plan.employee?._id === personnelId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Leave Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan annual leave with a named relief colleague for every session.
          </p>
        </div>
        <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
          <SelectTrigger className="w-[140px]">
            <CalendarDays className="mr-2 size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((item) => (
              <SelectItem key={item} value={String(item)}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {canReview ? (
        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">My plan</TabsTrigger>
            <TabsTrigger value="team">Team plans</TabsTrigger>
          </TabsList>
          <TabsContent value="mine" className="mt-4">
            <MyLeavePlan
              year={year}
              plan={myPlan}
              plans={yearPlans}
              staff={staff}
              personnelId={personnelId}
            />
          </TabsContent>
          <TabsContent value="team" className="mt-4">
            <TeamLeavePlans
              year={year}
              plans={yearPlans}
              canApprove={can(PERMISSIONS["leave:approve"])}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <MyLeavePlan
          year={year}
          plan={myPlan}
          plans={yearPlans}
          staff={staff}
          personnelId={personnelId}
        />
      )}
    </div>
  );
}
