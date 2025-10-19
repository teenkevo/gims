import { useState, useTransition } from "react";
import type { RFI, ConversationMessage } from "../types/rfi.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Paperclip,
  User,
  Building,
  CornerDownRight,
  CornerDownLeft,
  RefreshCcw,
  FileStack,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_RFIS_QUERYResult } from "../../../../../sanity.types.js";
import { sendMessageToRFI } from "@/lib/actions";
import { toast } from "sonner";

interface RFIDetailProps {
  rfi: ALL_RFIS_QUERYResult[number];
  onUpdateRFI: (rfi: ALL_RFIS_QUERYResult[number]) => void;
}

export function RFIDetail({ rfi, onUpdateRFI }: RFIDetailProps) {
  const [newMessage, setNewMessage] = useState("");
  const [newStatus, setNewStatus] = useState(rfi.status);
  const [isPending, startTransition] = useTransition();

  console.log(Boolean("false"));
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("rfiId", rfi._id || "");
        formData.append("message", newMessage);
        formData.append("sentByClient", "false");
        formData.append("clientSender", "fi9cAQAozMYCAhgLkY6pF2");
        formData.append("labSender", "jV1aTfIhlBR8NUdNOYrNqx"); // You may need to get the current lab user ID
        formData.append("timestamp", new Date().toISOString());

        const result = await sendMessageToRFI(null, formData);

        if (result.status === "ok") {
          // Update local state optimistically
          const message = {
            _key: `msg-${Date.now()}`,
            message: newMessage,
            sentByClient: false,
            clientSender: null,
            labSender: null,
            attachments: [],
            timestamp: new Date().toISOString(),
          };

          const updatedRFI: ALL_RFIS_QUERYResult[number] = {
            ...rfi,
            conversation: [...(rfi.conversation || []), message],
            status: rfi.status === "open" ? "in_progress" : rfi.status,
          };

          onUpdateRFI(updatedRFI);
          setNewMessage("");
          toast.success("Message sent successfully");
        } else {
          toast.error("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      }
    });
  };

  const handleStatusChange = (
    status: ALL_RFIS_QUERYResult[number]["status"]
  ) => {
    const updatedRFI: ALL_RFIS_QUERYResult[number] = {
      ...rfi,
      status,
      dateResolved: status === "resolved" ? new Date().toISOString() : null,
    };
    onUpdateRFI(updatedRFI);
    setNewStatus(status);
  };

  const getInitiationTypeIcon = (
    type: ALL_RFIS_QUERYResult[number]["initiationType"]
  ) => {
    switch (type) {
      case "internal_internal":
        return <RefreshCcw className="w-4 h-4" />;
      case "internal_external":
        return <CornerDownLeft className="w-4 h-4" />;
      case "external_internal":
        return <CornerDownRight className="w-4 h-4" />;
    }
  };

  const getInitiationTypeLabel = (
    type: ALL_RFIS_QUERYResult[number]["initiationType"]
  ) => {
    switch (type) {
      case "internal_internal":
        return "Internal Communication";
      case "internal_external":
        return "Outgoing to Client";
      case "external_internal":
        return "Incoming from Client";
    }
  };

  const getStatusIcon = (status: ALL_RFIS_QUERYResult[number]["status"]) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-start justify-between mb-4 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {getInitiationTypeIcon(rfi.initiationType)}
                  <Badge variant="outline" className="text-xs">
                    <span className="sm:hidden">
                      {
                        getInitiationTypeLabel(rfi.initiationType)?.split(
                          " "
                        )[0]
                      }
                    </span>
                    <span className="hidden sm:inline">
                      {getInitiationTypeLabel(rfi.initiationType)?.split(
                        " "
                      )[0] || ""}
                    </span>
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {rfi._id.toUpperCase()}
                  </Badge>
                </div>
                <h1 className="text-lg sm:text-2xl font-semibold mb-2 break-words">
                  {rfi.subject}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {rfi.description}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {getStatusIcon(rfi.status)}
                <Select
                  value={newStatus || ""}
                  onValueChange={(value) =>
                    handleStatusChange(
                      value as ALL_RFIS_QUERYResult[number]["status"]
                    )
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-24 sm:w-32">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                {rfi.project && (
                  <div className="flex items-center gap-2">
                    <FileStack className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">Project:</span>
                    <span className="truncate">{rfi.project?.name || ""}</span>
                  </div>
                )}
                {rfi.client && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">Client:</span>
                    <span className="truncate">{rfi.client?.name || ""}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-xs sm:text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">Initiated:</span>{" "}
                  {new Date(rfi.dateSubmitted || "").toLocaleString()}
                </div>
                {rfi.dateResolved && (
                  <div className="text-xs sm:text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">Resolved:</span>{" "}
                    {new Date(rfi.dateResolved || "").toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium mb-2">Participants</div>
              <div className="flex flex-wrap gap-1 sm:gap-2 text-xs">
                {rfi.labInitiator && (
                  <Badge variant="secondary" className="text-xs">
                    <span className="sm:hidden">
                      Lab: {rfi.labInitiator?.fullName || ""}
                    </span>
                    <span className="hidden sm:inline">
                      Lab: {rfi.labInitiator?.fullName || ""} (
                      {rfi.labInitiator?.departmentRoles
                        ?.map((role) => role.department?.name || "")
                        .join(", ") || ""}
                      )
                    </span>
                  </Badge>
                )}
                {rfi.labReceiver && (
                  <Badge variant="secondary" className="text-xs">
                    <span className="sm:hidden">
                      Lab: {rfi.labReceiver?.fullName || ""}
                    </span>
                    <span className="hidden sm:inline">
                      Lab: {rfi.labReceiver?.fullName || ""} (
                      {rfi.labReceiver?.departmentRoles
                        ?.map((role) => role.role || "")
                        .join(", ") || ""}
                      )
                    </span>
                  </Badge>
                )}
                {rfi.labInitiatorExternal && (
                  <Badge variant="secondary" className="text-xs">
                    <span className="sm:hidden">
                      Lab: {rfi.labInitiatorExternal?.fullName || ""}
                    </span>
                    <span className="hidden sm:inline">
                      Lab: {rfi.labInitiatorExternal?.fullName || ""} (
                      {rfi.labInitiatorExternal?.departmentRoles
                        ?.map((role) => role.role || "")
                        .join(", ") || ""}
                      )
                    </span>
                  </Badge>
                )}
                {rfi.labReceiverExternal && (
                  <Badge variant="secondary" className="text-xs">
                    <span className="sm:hidden">
                      Lab: {rfi.labReceiverExternal?.fullName || ""}
                    </span>
                    <span className="hidden sm:inline">
                      Lab: {rfi.labReceiverExternal?.fullName || ""} (
                      {rfi.labReceiverExternal?.departmentRoles
                        ?.map((role) => role.role || "")
                        .join(", ") || ""}
                      )
                    </span>
                  </Badge>
                )}
                {rfi.clientInitiator && (
                  <Badge variant="outline" className="text-xs">
                    <span className="sm:hidden">
                      Client: {rfi.clientInitiator.name}
                    </span>
                    <span className="hidden sm:inline">
                      Client: {rfi.clientInitiator.name} (
                      {rfi.clientInitiator.designation})
                    </span>
                  </Badge>
                )}
                {rfi.clientReceiver && (
                  <Badge variant="outline" className="text-xs">
                    <span className="sm:hidden">
                      Client: {rfi.clientReceiver.name}
                    </span>
                    <span className="hidden sm:inline">
                      Client: {rfi.clientReceiver.name} (
                      {rfi.clientReceiver.designation})
                    </span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Initial Attachments */}
            {rfi.attachments && rfi.attachments.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">
                  Initial Attachments
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {rfi.attachments.map((attachment, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="gap-1 text-xs"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[120px] sm:max-w-none">
                        {attachment.asset?.originalFilename || ""}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conversation Section - Chat Bubbles */}
          <div className="px-4 sm:px-6">
            <div className="space-y-6">
              {rfi.conversation &&
                rfi.conversation.length > 0 &&
                rfi.conversation.map((message) => (
                  <div
                    key={message._key}
                    className={cn(
                      "flex",
                      message.sentByClient ? "justify-start" : "justify-end"
                    )}
                  >
                    <div className="flex flex-col max-w-[80%]">
                      {/* Sender info */}
                      <div
                        className={cn(
                          "flex items-center gap-2 mb-1 text-xs",
                          message.sentByClient ? "justify-start" : "justify-end"
                        )}
                      >
                        {message.sentByClient ? (
                          <>
                            <User className="w-3 h-3 text-blue-500" />
                            <span className="font-medium">
                              {message.clientSender?.name}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(
                                message.timestamp || ""
                              ).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-muted-foreground">
                              {new Date(
                                message.timestamp || ""
                              ).toLocaleString()}
                            </span>
                            <span className="font-medium">
                              {message.labSender?.fullName || ""}
                            </span>
                            <Building className="w-3 h-3 text-green-500" />
                          </>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div
                        className={cn(
                          "relative p-3 rounded-lg",
                          message.sentByClient
                            ? "bg-blue-100 text-blue-900 rounded-tl-none"
                            : "bg-green-100 text-green-900 rounded-tr-none"
                        )}
                      >
                        {/* Pointed end / tail */}
                        <div
                          className={cn(
                            "absolute top-0 w-3 h-3",
                            message.sentByClient
                              ? "left-0 -translate-x-[6px] border-t-8 border-r-8 border-t-transparent border-r-blue-100"
                              : "right-0 translate-x-[6px] border-t-8 border-l-8 border-t-transparent border-l-green-100"
                          )}
                        ></div>

                        {/* Message content */}
                        <p className="text-sm break-words">{message.message}</p>

                        {/* Attachments */}
                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-opacity-20 border-current">
                              {message.attachments.map((attachment) => (
                                <div
                                  key={attachment.asset?._id || ""}
                                  className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white bg-opacity-50"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span className="truncate max-w-[100px] sm:max-w-none">
                                    {attachment.asset?.originalFilename || ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

              {rfi.conversation && rfi.conversation.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No messages yet. Start the conversation below!
                </div>
              )}
            </div>
          </div>

          {/* Reply Section */}
          {rfi.status !== "resolved" && (
            <div className="p-4 sm:p-6 border-t">
              <div className="space-y-3">
                <div className="text-sm font-medium mb-2">
                  Reply to this RFI
                </div>
                <Textarea
                  placeholder="Type your reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] text-sm"
                  disabled={isPending}
                />
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <Paperclip className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Attach Files</span>
                    <span className="sm:hidden">Attach</span>
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isPending}
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <Send className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {isPending ? "Sending..." : "Send Reply"}
                    </span>
                    <span className="sm:hidden">
                      {isPending ? "..." : "Send"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* End of content spacer */}
          <div className="h-4"></div>
        </div>
      </ScrollArea>
    </div>
  );
}
