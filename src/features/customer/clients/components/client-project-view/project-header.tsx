"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ListEnd, ListStart, TriangleAlert } from "lucide-react";

interface ProjectHeaderProps {
  clientName: string;
  projectName: string;
  internalId: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export default function ProjectHeader({
  clientName,
  projectName,
  internalId,
  startDate,
  endDate,
}: ProjectHeaderProps) {
  // Format the month and year for the subtitle, using current month if no startDate
  const monthYear = startDate ? format(startDate, "MMMM yyyy") : format(new Date(), "MMMM yyyy");

  // Format the full date display or show "NOT YET SET" if date is not provided
  const formatFullDate = (date: Date | null | undefined) => {
    if (!date) return "Not yet set";
    return format(date, "EEEE, MMMM d, yyyy").toUpperCase();
  };

  return (
    <div className="border rounded-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
        <div>
          <p className="text-sm text-muted-foreground">{clientName}</p>
          <h1 className="text-xl md:text-2xl md:max-w-2xl font-bold mb-5">{projectName}</h1>
          <Badge variant="outline">{internalId}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-medium uppercase text-muted-foreground min-w-20 text-sm">
              Start Date
            </span>
            <div
              className={`flex ${
                startDate ? "border-muted-foreground/20" : "border-orange-500"
              } border border-1 text-sm items-center tracking-tight px-2 py-1 rounded`}
            >
              {startDate ? (
                <ListStart className="text-primary w-4 h-4 mr-2" />
              ) : (
                <TriangleAlert className="text-orange-500 w-4 h-4 mr-2" />
              )}
              <span className="text-sm tracking-tight">{formatFullDate(startDate)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="font-medium uppercase text-muted-foreground min-w-20 text-sm">
              End Date
            </span>
            <div
              className={`flex ${
                endDate ? "border-muted-foreground/20" : "border-orange-500"
              } border border-1 text-sm items-center tracking-tight px-2 py-1 rounded`}
            >
              {endDate ? (
                <ListEnd className="text-primary w-4 h-4 mr-2" />
              ) : (
                <TriangleAlert className="text-orange-500 w-4 h-4 mr-2" />
              )}
              <span className="text-sm tracking-tight">{formatFullDate(endDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
