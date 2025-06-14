"use client";

import type { ALL_PERSONNEL_QUERYResult } from "../../../../../sanity.types";
import { DataTableRowActions } from "./row-actions/data-table-row-actions";

interface ExecutiveCardsProps {
  executives: Array<{
    person: ALL_PERSONNEL_QUERYResult[number];
    role: string;
  }>;
  departmentRoles: Record<
    string,
    { roles: (string | undefined)[]; departmentId: string }
  >;
}

export function ExecutiveCards({
  executives,
  departmentRoles,
}: ExecutiveCardsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {executives.map(({ person, role }, index) => (
        <div
          key={`${person._id}-${index}`}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {getInitials(person.fullName || "")}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {person.fullName}
                </h3>
                <p className="text-xs text-muted-foreground">{person.email}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-primary mt-1">
                    {role}
                  </p>
                  {person.departmentRoles &&
                    person.departmentRoles.length > 1 && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        +{person.departmentRoles.length - 1} other role
                        {person.departmentRoles.length > 2 ? "s" : ""}
                      </p>
                    )}
                </div>
              </div>
            </div>
            <DataTableRowActions
              personnel={person}
              departmentRoles={departmentRoles}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
