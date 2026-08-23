"use client";

// core
import * as React from "react";

// types
import { ALL_PROJECTS_QUERY_RESULT } from "../../../../../sanity.types";

// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// custom
import NoProjectsPlaceholder from "./no-projects-placeholder";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";
import { DataTable } from "./projects-table/data-table";
import { Can } from "@/components/auth/can";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useRBAC } from "@/components/rbac-context";
import {
  DUE_STATUS_FILTERS,
  QUOTATION_STATUS_FILTERS,
} from "../constants";
import type { ColumnFiltersState } from "@tanstack/react-table";

const QUOTATION_STATUS_VALUES = new Set(
  QUOTATION_STATUS_FILTERS.map((option) => option.value)
);
const DUE_STATUS_VALUES = new Set(
  DUE_STATUS_FILTERS.map((option) => option.value)
);

function initialFiltersFromParams(
  quotationStatus?: string,
  dueStatus?: string
): ColumnFiltersState {
  const filters: ColumnFiltersState = [];
  if (quotationStatus && QUOTATION_STATUS_VALUES.has(quotationStatus as never)) {
    filters.push({ id: "quotationStatus", value: [quotationStatus] });
  }
  if (dueStatus && DUE_STATUS_VALUES.has(dueStatus as never)) {
    filters.push({ id: "dueStatus", value: [dueStatus] });
  }
  return filters;
}

export function ProjectsView({
  projects,
  quotationStatus,
  dueStatus,
}: {
  projects: ALL_PROJECTS_QUERY_RESULT;
  quotationStatus?: string;
  dueStatus?: string;
}) {
  const { can } = useRBAC();
  const canCreate = can(PERMISSIONS["projects:create"]);
  const initialColumnFilters = initialFiltersFromParams(
    quotationStatus,
    dueStatus
  );
  const defaultTab =
    quotationStatus && quotationStatus !== "none" ? "quoted" : "in-progress";

  const quotedProjects = projects.filter((project) => project.quotation);
  // TODO: get completed projects
  const completedProjects: ALL_PROJECTS_QUERY_RESULT = [];
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Projects</h1>
      <Tabs defaultValue={defaultTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="quoted">Quoted</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          {projects.length > 0 && (
            <Can permission={PERMISSIONS["projects:create"]}>
              <Button asChild className="sm:w-auto" variant="default">
                <Link href="/projects/create" className="my-2 flex items-center">
                  <PlusCircleIcon className="h-5 w-5 md:mr-2" />
                  <span className="hidden sm:inline">Create New Project</span>
                </Link>
              </Button>
            </Can>
          )}
        </div>
        <TabsContent value="in-progress">
          {projects.length > 0 ? (
            <div className="mt-5">
              <DataTable
                key={`in-progress-${quotationStatus}-${dueStatus}`}
                data={projects}
                initialColumnFilters={initialColumnFilters}
              />
            </div>
          ) : (
            <NoProjectsPlaceholder
              helperText="running projects"
              needAction={canCreate}
            />
          )}
        </TabsContent>
        <TabsContent value="quoted">
          {quotedProjects.length > 0 ? (
            <div className="mt-5">
              <DataTable
                key={`quoted-${quotationStatus}-${dueStatus}`}
                data={quotedProjects}
                initialColumnFilters={initialColumnFilters}
              />
            </div>
          ) : (
            <NoProjectsPlaceholder helperText="quoted projects" />
          )}
        </TabsContent>
        <TabsContent value="completed">
          {completedProjects.length > 0 ? (
            <div className="mt-5">
              <DataTable data={completedProjects} />
            </div>
          ) : (
            <NoProjectsPlaceholder helperText="completed projects" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
