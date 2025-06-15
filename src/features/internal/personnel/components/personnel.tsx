"use client";

import { useState, useMemo } from "react";
import { PersonnelSearch } from "./personnel-search";
import { ExecutiveCards } from "./executive-cards";
import { PersonnelTable } from "./personnel-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ALL_DEPARTMENTS_QUERYResult,
  ALL_PERSONNEL_QUERYResult,
} from "../../../../../sanity.types";
import Image from "next/image";

export default function PersonnelManager({
  personnel,
  departments,
}: {
  personnel: ALL_PERSONNEL_QUERYResult;
  departments: ALL_DEPARTMENTS_QUERYResult;
}) {
  const departmentRoles: Record<
    string,
    { roles: (string | undefined)[]; departmentId: string }
  > = {};

  departments.forEach((dept) => {
    departmentRoles[dept.department || ""] = {
      roles: dept.roles?.map((role) => role?.roleName) || [],
      departmentId: dept._id,
    };
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filteredPersonnel = useMemo(() => {
    return personnel.filter((person) => {
      const matchesSearch =
        person.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.departmentRoles?.some((dr) =>
          dr.role?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesRole =
        roleFilter === "all" ||
        person.departmentRoles?.some((dr) =>
          dr.role?.toLowerCase().includes(roleFilter.replace("-", " "))
        );

      const matchesDepartment =
        departmentFilter === "all" ||
        person.departmentRoles?.some((dr) =>
          dr.department?.department
            ?.toLowerCase()
            .includes(departmentFilter.replace("-", " "))
        );

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [personnel, searchTerm, roleFilter, departmentFilter]);

  const { executives, departmentsWithPersonnel } = useMemo(() => {
    const executives: Array<{
      person: ALL_PERSONNEL_QUERYResult[number];
      role: string;
    }> = [];
    const personnelByDepartment = new Map<
      string,
      Array<{ person: ALL_PERSONNEL_QUERYResult[number]; role: string }>
    >();

    // First, organize personnel by department
    filteredPersonnel.forEach((person) => {
      person.departmentRoles?.forEach((dr) => {
        if (dr.department && dr.role) {
          const entry = { person, role: dr.role };
          const deptId = dr.department._id;
          const deptName = dr.department.department || "Unknown";

          // Check if this is from Management department (executives)
          if (deptName.toLowerCase() === "management") {
            executives.push(entry);
          } else {
            // Add to regular departments
            if (!personnelByDepartment.has(deptId)) {
              personnelByDepartment.set(deptId, []);
            }
            personnelByDepartment.get(deptId)!.push(entry);
          }
        }
      });
    });

    // Create department objects for all departments (including empty ones)
    const departmentsWithPersonnel: {
      _id: string;
      department: string | null;
      roles: Array<{
        roleName?: string;
        description?: string;
      }> | null;
      personnel: Array<{
        person: ALL_PERSONNEL_QUERYResult[number];
        role: string;
      }>;
      count: number;
    }[] = departments
      .filter((dept) => dept.department?.toLowerCase() !== "management") // Exclude management from regular departments
      .map((dept) => {
        const personnel = personnelByDepartment.get(dept._id) || [];
        return {
          _id: dept._id,
          department: dept.department,
          roles:
            dept.roles?.map((role) => ({
              roleName: role.roleName,
              description: role.description
                ?.map((block) =>
                  block.children?.map((child) => child.text).join("")
                )
                .join(" "),
            })) || null,
          personnel: personnel.sort((a, b) =>
            (a.person.fullName || "").localeCompare(b.person.fullName || "")
          ),
          count: personnel.length,
        };
      })
      .sort((a, b) => (a.department || "").localeCompare(b.department || ""));

    return {
      executives: executives.sort((a, b) =>
        (a.person.fullName || "").localeCompare(b.person.fullName || "")
      ),
      departmentsWithPersonnel,
    };
  }, [filteredPersonnel, departments]);

  return (
    <div className="min-h-screen bg-background">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Lab Personnel</h1>
            <p className="text-muted-foreground mt-1">
              Manage your laboratory personnel
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <PersonnelSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          departmentFilter={departmentFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          departmentRoles={departmentRoles}
        />

        {/* Executive Cards */}

        <div className="mb-8">
          <Accordion
            type="single"
            collapsible
            defaultValue="executives"
            className="w-full"
          >
            <AccordionItem
              value="executives"
              className="border border-border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">Management</span>
                  <span className="text-sm text-muted-foreground">
                    ({executives.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {executives.length > 0 ? (
                  <ExecutiveCards
                    executives={executives}
                    departmentRoles={departmentRoles}
                  />
                ) : (
                  <div className="text-center items-center justify-center text-muted-foreground">
                    <Image
                      priority
                      src="/people-who-support-svgrepo-com.svg"
                      alt="Users"
                      width={100}
                      height={100}
                      className="mx-auto"
                    />
                    <p className="text-sm">
                      Every team needs some management. Won't hurt to add some
                      team leads.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Department Sections */}
        <div className="space-y-4">
          {departmentsWithPersonnel.map((department) => {
            if (department.department !== "Management") {
              return (
                <Accordion
                  key={department.department}
                  type="single"
                  collapsible
                  defaultValue={department.department || ""}
                  className="w-full"
                >
                  <AccordionItem
                    value={department.department || ""}
                    className="border border-border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">
                          {department.department || ""}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({department.count})
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <PersonnelTable
                        personnel={department.personnel}
                        departmentRoles={departmentRoles}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
