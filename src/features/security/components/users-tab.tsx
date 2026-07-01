"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { PersonnelAccessRow } from "@/lib/auth/security-data";
import { fetchSecurityUsers } from "@/lib/auth/security-tab-actions";
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

export function UsersTab() {
  const [users, setUsers] = useState<PersonnelAccessRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSecurityUsers();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (isLoading || users === null) {
    return <SecurityTabLoading />;
  }

  return (
    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Personnel onboarded in HR with their departmental roles and invitation
          status.
        </CardDescription>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="rounded-md border bg-background">
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No personnel records yet.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((person) => (
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
  );
}
