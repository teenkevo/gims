import React, { useState } from "react";
import { getCurrentStageIndex, possibleStages } from "../constants";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Project } from "../../../../../sanity.types";

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
          className={`md:w-10 w-6 h-2 rounded ${
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

export default function ProjectStage(project: Project) {
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
