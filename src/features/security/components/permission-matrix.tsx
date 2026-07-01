"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Permission } from "@/lib/auth/permissions";
import {
  PERMISSION_RESOURCES,
  isPermissionEnabled,
  togglePermission,
  type CrudAction,
} from "@/lib/auth/permission-resources";

const CRUD_COLUMNS: { action: CrudAction; label: string }[] = [
  { action: "create", label: "Create" },
  { action: "read", label: "Read" },
  { action: "update", label: "Update" },
  { action: "delete", label: "Delete" },
];

interface PermissionMatrixProps {
  permissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  disabled?: boolean;
}

export function PermissionMatrix({
  permissions,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const handleToggle = (resourceKey: string, action: string, checked: boolean) => {
    onChange(togglePermission(permissions, resourceKey, action, checked));
  };

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[220px] text-muted-foreground font-medium">
              Resource
            </TableHead>
            {CRUD_COLUMNS.map((col) => (
              <TableHead
                key={col.action}
                className="text-center text-muted-foreground font-medium"
              >
                {col.label}
              </TableHead>
            ))}
            <TableHead className="text-center text-muted-foreground font-medium w-24">
              Other
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERMISSION_RESOURCES.map((resource) => (
            <TableRow key={resource.key}>
              <TableCell className="font-medium">{resource.label}</TableCell>
              {CRUD_COLUMNS.map((col) => {
                const supported = resource.actions.includes(col.action);
                return (
                  <TableCell key={col.action} className="text-center">
                    {supported ? (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={isPermissionEnabled(
                            permissions,
                            resource.key,
                            col.action
                          )}
                          onCheckedChange={(checked) =>
                            handleToggle(
                              resource.key,
                              col.action,
                              checked === true
                            )
                          }
                          disabled={disabled}
                          aria-label={`${resource.label} ${col.label}`}
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                );
              })}
              <TableCell className="text-center">
                {resource.extraActions?.length ? (
                  <div className="flex flex-col items-center gap-2">
                    {resource.extraActions.map((extra) => (
                      <label
                        key={extra.action}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer"
                      >
                        <Checkbox
                          checked={isPermissionEnabled(
                            permissions,
                            resource.key,
                            extra.action
                          )}
                          onCheckedChange={(checked) =>
                            handleToggle(
                              resource.key,
                              extra.action,
                              checked === true
                            )
                          }
                          disabled={disabled}
                        />
                        {extra.label}
                      </label>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
