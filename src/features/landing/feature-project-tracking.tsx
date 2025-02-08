import React, { ComponentProps } from "react";
import { formatDistanceToNow, isBefore } from "date-fns";
import { cn, toTitleCase } from "@/lib/utils";
import { CheckCircle, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { projects } from "./mock-projects";

export function FeatureProjectTracking() {
  return projects.map((item) => (
    <figure
      key={item.id}
      className={cn(
        "relative h-80 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
      )}
    >
      <button
        key={item.id}
        className={
          "flex flex-col items-start gap-2 text-left text-sm transition-all"
        }
      >
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center">
            <div className="flex items-center mr-6 gap-2">
              <div className="font-semibold">{item.name}</div>
              {item.stages.includes("REPORTING") && (
                <span className="flex h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
          </div>
          <div className={"text-md text-muted-foreground"}>
            Client - {item.client}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 my-4">
          {possibleStages.map((stage) => (
            <Badge
              className="font-normal text-xs"
              key={stage}
              variant={getBadgeVariantFromLabel(item.stages, stage)}
            >
              {getBadgeVariantFromLabel(item.stages, stage) === "default" ? (
                <CheckCircle
                  strokeWidth={3}
                  className="flex h-4 w-4 mr-2 text-[#43AC33]"
                />
              ) : (
                <Loader
                  strokeWidth={3}
                  className="flex h-3 w-3 mr-2" // Adjust the color as needed
                />
              )}
              {toTitleCase(stage)}
            </Badge>
          ))}
        </div>
        <div className={"text-xs text-muted-foreground"}>
          {isBefore(new Date(item.date), new Date()) ? "Started" : "Starting"}{" "}
          {formatDistanceToNow(new Date(item.dueDate), {
            addSuffix: true,
          })}
        </div>
      </button>
    </figure>
  ));
}

const possibleStages = [
  "BILLING",
  "SAMPLING",
  "TESTING",
  "ANALYSIS",
  "REPORTING",
];

function getBadgeVariantFromLabel(
  itemStages: string[],
  stage: string
): ComponentProps<typeof Badge>["variant"] {
  const completed = possibleStages.filter((stage) =>
    itemStages.includes(stage)
  );

  if (completed.includes(stage)) {
    return "default";
  }

  return "outline";
}
