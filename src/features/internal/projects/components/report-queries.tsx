"use client";

import * as React from "react";
import { format } from "date-fns";
import { MessageSquarePlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  closeReportQuery,
  createReportQuery,
  respondToReportQuery,
} from "@/lib/report-actions";
import type { PROJECT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import { cn } from "@/lib/utils";

type ProjectReport = NonNullable<PROJECT_BY_ID_QUERY_RESULT[number]["report"]>;
type ReportQuery = NonNullable<ProjectReport["queries"]>[number];

function QueryStatusBadge({ status }: { status: ReportQuery["status"] }) {
  const variant =
    status === "closed"
      ? "secondary"
      : status === "answered"
        ? "default"
        : "outline";

  return (
    <Badge variant={variant} className="capitalize text-xs">
      {(status || "open").replace("_", " ")}
    </Badge>
  );
}

function CreateQueryDialog({
  projectId,
  reportId,
}: {
  projectId: string;
  reportId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("reportId", reportId);
      formData.append("subject", subject.trim());
      formData.append("message", message.trim());

      const result = await createReportQuery({}, formData);
      if (result.status === "ok") {
        toast.success("Query submitted");
        setOpen(false);
        setSubject("");
        setMessage("");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to submit query");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit query");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Ask a question
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Query this report</DialogTitle>
          <DialogDescription>
            Ask the lab a question about the report. They can reply on this
            thread.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query-subject">Subject</Label>
            <Input
              id="query-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is your question about?"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="query-message">Message</Label>
            <Textarea
              id="query-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question in detail"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit query"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QueryThread({
  projectId,
  reportId,
  query,
}: {
  projectId: string;
  reportId: string;
  query: ReportQuery;
}) {
  const { can, isClientUser } = useRBAC();
  const [reply, setReply] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [open, setOpen] = React.useState(query.status === "open");

  const canReplyAsClient = isClientUser && can(PERMISSIONS["report:query"]);
  const canReplyAsLab = !isClientUser && can(PERMISSIONS["report:respond"]);
  const canReply =
    query.status !== "closed" && (canReplyAsClient || canReplyAsLab);

  const handleReply = async (markAnswered = false) => {
    if (!reply.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("reportId", reportId);
      formData.append("queryKey", query._key);
      formData.append("message", reply.trim());
      formData.append("sentByClient", isClientUser ? "true" : "false");
      formData.append("markAnswered", markAnswered ? "true" : "false");

      const result = await respondToReportQuery({}, formData);
      if (result.status === "ok") {
        toast.success(markAnswered ? "Reply sent and marked answered" : "Reply sent");
        setReply("");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to send reply");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("reportId", reportId);
      formData.append("queryKey", query._key);
      const result = await closeReportQuery({}, formData);
      if (result.status === "ok") {
        toast.success("Query closed");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to close query");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to close query");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border bg-gradient-to-b from-muted/20 to-muted/40 p-4">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-start justify-between gap-3 text-left"
          >
            <div>
              <p className="font-medium">{query.subject}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {query.createdBy?.name || "Client"}
                {query.createdAt
                  ? ` · ${format(new Date(query.createdAt), "dd MMM yyyy HH:mm")}`
                  : ""}
              </p>
            </div>
            <QueryStatusBadge status={query.status} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-4">
          <div className="space-y-3">
            {(query.messages || []).map((msg) => (
              <div
                key={msg._key}
                className={cn(
                  "rounded-md border p-3 text-sm",
                  msg.sentByClient
                    ? "bg-background"
                    : "bg-primary/5 border-primary/20"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-medium text-xs">
                    {msg.senderName || (msg.sentByClient ? "Client" : "Lab")}
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      · {msg.sentByClient ? "Client" : "Lab"}
                    </span>
                  </span>
                  {msg.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(msg.timestamp), "dd MMM yyyy HH:mm")}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{msg.message}</p>
              </div>
            ))}
          </div>

          {canReply && (
            <div className="space-y-2">
              <Label htmlFor={`reply-${query._key}`}>Reply</Label>
              <Textarea
                id={`reply-${query._key}`}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
              />
              <div className="flex flex-wrap gap-2 justify-end">
                {isClientUser && query.status !== "closed" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={handleClose}
                  >
                    Close query
                  </Button>
                )}
                {!isClientUser && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isSubmitting || !reply.trim()}
                    onClick={() => handleReply(true)}
                  >
                    Reply & mark answered
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmitting || !reply.trim()}
                  onClick={() => handleReply(false)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send reply"}
                </Button>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function ReportQueries({
  project,
  report,
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
  report: ProjectReport;
}) {
  const { can, isClientUser } = useRBAC();
  const queries = report.queries || [];
  const canCreateQuery =
    isClientUser &&
    can(PERMISSIONS["report:query"]) &&
    report.status === "sent_to_client";

  if (report.status !== "sent_to_client") {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Report queries
          </h3>
          <p className="text-sm text-muted-foreground">
            {isClientUser
              ? "Ask questions about this report once it has been issued to you."
              : "Respond to client questions about this report."}
          </p>
        </div>
        {canCreateQuery && (
          <CreateQueryDialog projectId={project._id} reportId={report._id} />
        )}
      </div>

      {queries.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No queries yet.
        </div>
      ) : (
        <div className="space-y-3">
          {queries.map((query) => (
            <QueryThread
              key={query._key}
              projectId={project._id}
              reportId={report._id}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}
