"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { AuditLogEntry } from "@/sanity/lib/auth/getAuditLogs";
import { fetchSecurityAuditLogs } from "@/lib/auth/security-tab-actions";
import { SecurityTabLoading } from "./security-tab-loading";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AuditLogTab() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSecurityAuditLogs();
      setAuditLogs(data);
    } catch {
      toast.error("Failed to load audit log");
      setAuditLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  if (isLoading || auditLogs === null) {
    return <SecurityTabLoading />;
  }

  return (
    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
      <CardHeader>
        <CardTitle>Audit log</CardTitle>
        <CardDescription>
          Recent security-relevant actions across the application.
        </CardDescription>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No audit entries yet.
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.timestamp), "PPp")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.resource}
                      {log.resourceId ? ` · ${log.resourceId}` : ""}
                    </TableCell>
                    <TableCell>{log.userEmail}</TableCell>
                    <TableCell>{log.userRole}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
