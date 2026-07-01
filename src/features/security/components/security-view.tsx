"use client";

import { format } from "date-fns";
import type { AuditLogEntry } from "@/sanity/lib/auth/getAuditLogs";
import type {
  PermissionMatrixRow,
  PersonnelAccessRow,
} from "@/lib/auth/security-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SecurityViewProps {
  auditLogs: AuditLogEntry[];
  permissionMatrix: PermissionMatrixRow[];
  personnelAccess: PersonnelAccessRow[];
}

export function SecurityView({
  auditLogs,
  permissionMatrix,
  personnelAccess,
}: SecurityViewProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Internal access is granted through HR personnel onboarding. Each
          departmental role has predefined permissions applied at login.
        </p>
      </div>

      <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
        <CardHeader>
          <CardTitle>Departmental role permissions</CardTitle>
          <CardDescription>
            Defined in the permission matrix. HR assigns these roles when
            onboarding personnel — no separate role assignment is required.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Job title</TableHead>
                  <TableHead>Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissionMatrix.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-medium">
                      {row.departmentName}
                    </TableCell>
                    <TableCell>{row.roleName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {row.permissions.map((permission) => (
                          <Badge
                            key={permission}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
        <CardHeader>
          <CardTitle>Personnel app access</CardTitle>
          <CardDescription>
            Staff onboarded in HR with their departmental roles and invitation
            status.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departmental role(s)</TableHead>
                  <TableHead>App access</TableHead>
                  <TableHead>Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personnelAccess.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No personnel records yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  personnelAccess.map((person) => (
                    <TableRow key={person._id}>
                      <TableCell className="font-medium">
                        {person.fullName}
                      </TableCell>
                      <TableCell>{person.email}</TableCell>
                      <TableCell className="max-w-xs text-sm">
                        {person.accessLabel}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {person.appAccessStatus ?? "none"}
                        </Badge>
                      </TableCell>
                      <TableCell>{person.permissionCount} granted</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>
            Recent security-relevant actions across the application.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="rounded-md border">
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
                      className="text-center text-muted-foreground"
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
    </div>
  );
}
