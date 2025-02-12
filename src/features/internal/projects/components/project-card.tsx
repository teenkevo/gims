import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getCurrentStageIndex, possibleStages } from "../constants";
import { format } from "date-fns";
import ProjectStage from "./project-stage";
import { ALL_PROJECTS_QUERYResult, Project } from "../../../../../sanity.types";
import { sanitizeString } from "@/lib/utils";

// Reusable InfoBlock component for displaying label-value pairs
function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-normal mb-1 text-muted-foreground">{label}</p>
      <div className="font-medium text-sm">{value}</div>
    </div>
  );
}

export default function ProjectCard(project: ALL_PROJECTS_QUERYResult[number]) {
  const { _id, name, clients, startDate, endDate } = project;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 rounded-t-xl bg-sidebar-primary-foreground dark:bg-white py-2">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-white dark:text-black uppercase">
            {name}
          </h2>
        </div>
      </CardHeader>
      <CardContent>
        {/* TODO: Add hyperlinks on client names redirecting to client details page */}
        <div className="my-5">
          <p className="text-xs font-normal mb-1 text-muted-foreground">
            Client
          </p>
          <div className="font-medium text-sm">
            {clients?.map((client) => client.name).join("  |  ")}
          </div>
        </div>
        <p className="text-sm my-5 tracking-tight"></p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {/* Using the reusable InfoBlock component */}
          <InfoBlock
            label="Start Date"
            value={format(startDate!, "MMM do, yyyy")}
          />
          <InfoBlock
            label="End Date"
            value={format(endDate!, "MMM do, yyyy")}
          />
          <InfoBlock label="Cost" value="UGX 500,000" />
          <InfoBlock
            label="Client Satisfaction "
            value={
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-primary">89%</span>
                <span className="text-sm">Out of 100</span>
              </div>
            }
          />
        </div>
      </CardContent>
      <div className="my-4 h-[2px] w-full bg-muted"></div>
      <CardFooter className="flex justify-between">
        {/* Stats section refactored using StatItem */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {/* <StatItem icon={Eye} value={20} /> */}
          <ProjectStage {...project} />
        </div>
        {/* View Listing Button */}

        <Button size="sm" variant="secondary" asChild>
          <Link
            href={`/projects/${_id}?project=${sanitizeString(project.name!)}`}
          >
            Go to project <ChevronRight className="ml-2 text-primary" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
