import type { RFI } from "../types/rfi.ts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  CornerDownLeft,
  CornerDownRight,
  RefreshCcw,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
interface RFIListProps {
  rfis: RFI[];
  selectedRFI: RFI | null;
  onSelectRFI: (rfi: RFI) => void;
}

export function RFIList({ rfis, selectedRFI, onSelectRFI }: RFIListProps) {
  const getInitiationTypeIcon = (type: RFI["initiationType"]) => {
    switch (type) {
      case "internal_internal":
        return <RefreshCcw className="w-4 h-4" />;
      case "internal_external":
        return <CornerDownLeft className="w-4 h-4" />;
      case "external_internal":
        return <CornerDownRight className="w-4 h-4" />;
    }
  };

  const getInitiationTypeLabel = (type: RFI["initiationType"]) => {
    switch (type) {
      case "internal_internal":
        return "Internal";
      case "internal_external":
        return "Outgoing";
      case "external_internal":
        return "Incoming";
    }
  };

  const getStatusIcon = (status: RFI["status"]) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: RFI["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-100 hover:bg-red-200 text-red-800 border-red-200";
      case "in_progress":
        return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 hover:bg-green-200 text-green-800 border-green-200";
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="pl-1 pr-4 py-2 space-y-3">
            {rfis.map((rfi) => (
              <div
                key={uuidv4()}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/50 border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg",
                  selectedRFI?.id === rfi.id && "ring-2 ring-primary"
                )}
                onClick={() => onSelectRFI(rfi)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getInitiationTypeIcon(rfi.initiationType)}
                        <Badge variant="outline" className="text-xs shrink-0">
                          {getInitiationTypeLabel(rfi.initiationType)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {getStatusIcon(rfi.status)}
                        <Badge
                          className={cn("text-xs", getStatusColor(rfi.status))}
                        >
                          <span className="sm:hidden">
                            {rfi.status.charAt(0).toUpperCase()}
                          </span>
                          <span className="hidden sm:inline">
                            {rfi.status.replace("_", " ").toUpperCase()}
                          </span>
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-1">
                        {rfi.subject}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {rfi.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {rfi.project && (
                        <div className="text-xs text-muted-foreground truncate">
                          <span className="font-medium">Project:</span>{" "}
                          {rfi.project.name}
                        </div>
                      )}
                      {rfi.client && (
                        <div className="text-xs text-muted-foreground truncate">
                          <span className="font-medium">Client:</span>{" "}
                          {rfi.client.name}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">
                        {
                          new Date(rfi.dateSubmitted)
                            .toISOString()
                            .split("T")[0]
                        }
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {rfi.attachments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{rfi.attachments.length}</span>
                          </div>
                        )}
                        {rfi.conversation.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <span className="sm:hidden">
                              {rfi.conversation.length}
                            </span>
                            <span className="hidden sm:inline">
                              {rfi.conversation.length} replies
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
