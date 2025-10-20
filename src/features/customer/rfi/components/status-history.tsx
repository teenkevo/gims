import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ALL_RFIS_QUERYResult } from "../../../../../sanity.types.js";

interface StatusHistoryProps {
  statusHistory: any[]; // Using any[] since the schema types haven't been regenerated yet
}

export function StatusHistory({ statusHistory }: StatusHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!statusHistory || statusHistory.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Open";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      default:
        return status;
    }
  };

  return (
    <Card className="mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <span>Status History</span>
                <Badge variant="secondary" className="text-xs">
                  {statusHistory.length} change
                  {statusHistory.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {statusHistory
                .slice()
                .reverse()
                .map((entry, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      index === 0 ? "bg-muted/30" : "bg-background"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(entry.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getStatusColor(entry.status)
                          )}
                        >
                          {getStatusLabel(entry.status)}
                        </Badge>
                        {entry.previousStatus &&
                          entry.previousStatus !== entry.status && (
                            <span className="text-xs text-muted-foreground">
                              from {getStatusLabel(entry.previousStatus)}
                            </span>
                          )}
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {entry.changedBy && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>
                              Changed by:{" "}
                              {entry.changedBy.fullName || "Unknown"}
                            </span>
                          </div>
                        )}
                        {entry.reason && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                            <span className="font-medium">Reason:</span>{" "}
                            {entry.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
