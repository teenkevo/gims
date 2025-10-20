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
  Star,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ALL_RFIS_QUERYResult } from "../../../../../sanity.types.js";

interface StatusHistoryProps {
  statusHistory: any[]; // Using any[] since the schema types haven't been regenerated yet
  conversation?: any[]; // Conversation data to find messages by key
}

export function StatusHistory({
  statusHistory,
  conversation,
}: StatusHistoryProps) {
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

  // Helper function to find message by key
  const findMessageByKey = (messageKey: string) => {
    if (!conversation) return null;
    return conversation.find((msg: any) => msg._key === messageKey);
  };

  return (
    <Card className="bg-transparent mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className=" cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <span>RFI Status History</span>
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
          <CardContent className="pt-4">
            <div className="space-y-3">
              {statusHistory
                .slice()
                .reverse()
                .map((entry, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3 p-4 md:p-6 rounded-lg border",
                      index === 0 ? "bg-muted/30" : "bg-background"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(entry.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-5">
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
                      <div className="space-y-2 text-xs text-muted-foreground">
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
                              Changed by: {entry.changedBy.email || "Unknown"}
                            </span>
                          </div>
                        )}
                        {entry.reason && (
                          <div className="mt-2 p-2 bg-muted/50 border border-muted-foreground/10 rounded text-xs">
                            <span className="font-medium">Reason:</span>{" "}
                            {entry.reason}
                          </div>
                        )}
                        {entry.officialMessageKey && (
                          <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded text-xs">
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-3 h-3 text-primary" />
                              <span className="font-medium text-primary">
                                Official Response:
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="font-mono text-xs text-primary/80">
                                Message Key: {entry.officialMessageKey}
                              </div>
                              {(() => {
                                const message = findMessageByKey(
                                  entry.officialMessageKey
                                );
                                if (message) {
                                  return (
                                    <div className="space-y-2">
                                      {/* Message content */}
                                      <div className="p-2 border border-primary/10 rounded text-xs">
                                        <div className="font-mono font-medium text-primary mb-1">
                                          Message:
                                        </div>
                                        <div className="font-mono break-words">
                                          {message.message}
                                        </div>
                                      </div>

                                      {/* Attachments */}
                                      {message.attachments &&
                                        message.attachments.length > 0 && (
                                          <div className="p-2  border border-primary/10 rounded text-xs">
                                            <div className="font-mono font-medium text-primary mb-2">
                                              Attachments:
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                              {message.attachments.map(
                                                (
                                                  attachment: any,
                                                  idx: number
                                                ) => (
                                                  <div
                                                    key={idx}
                                                    className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                                                  >
                                                    <FileText className="w-3 h-3" />
                                                    <span className="font-mono truncate max-w-[120px]">
                                                      {attachment.asset
                                                        ?.originalFilename ||
                                                        ""}
                                                    </span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                      {attachment.asset
                                                        ?.url && (
                                                        <>
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-4 w-4 p-0 hover:bg-transparent"
                                                            asChild
                                                          >
                                                            <a
                                                              href={
                                                                attachment.asset
                                                                  .url
                                                              }
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              title="View file"
                                                            >
                                                              <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                          </Button>
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-4 w-4 p-0 hover:bg-transparent"
                                                            asChild
                                                          >
                                                            <a
                                                              href={`${attachment.asset.url}?dl=${attachment.asset.originalFilename || "file"}`}
                                                              download
                                                              title="Download file"
                                                            >
                                                              <Download className="w-3 h-3" />
                                                            </a>
                                                          </Button>
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
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
