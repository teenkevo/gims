import React from "react";
import { getCurrentStageIndex, possibleStages } from "../constants";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { ALL_PROJECTS_QUERYResult } from "../../../../../sanity.types";

export function Stage({
  stage,
  currentStage,
  index,
}: {
  projectId: string;
  stage: string;
  currentStage: number;
  index: number;
}) {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger>
        <div
          key={stage}
          className={`w-6 h-2 rounded ${
            index < currentStage
              ? "bg-green-500"
              : index === currentStage
                ? "bg-orange-500"
                : "bg-gray-300"
          }`}
        />
      </HoverCardTrigger>
    </HoverCard>
  );
}

export default function ProjectStage(
  project: ALL_PROJECTS_QUERYResult[number]
) {
  const currentStage = getCurrentStageIndex(project);

  return (
    <div className="flex-col space-y-3">
      <p className="text-muted-foreground text-sm">
        <span className="text-orange-500">{possibleStages[currentStage]}</span>{" "}
        in progress
      </p>

      <div className="flex space-x-1">
        {possibleStages.map((stage, index) => (
          <Stage
            key={index}
            projectId={project._id}
            stage={stage}
            currentStage={currentStage}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
