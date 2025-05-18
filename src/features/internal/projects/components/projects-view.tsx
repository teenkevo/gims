"use client";

// core
import * as React from "react";

// types
import { ALL_PROJECTS_QUERYResult } from "../../../../../sanity.types";

// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// custom
import NoProjectsPlaceholder from "./no-projects-placeholder";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";
import { DataTable } from "./projects-table/data-table";
import { useRBAC } from "@/components/rbac-context";
export function ProjectsView({
  projects,
}: {
  projects: ALL_PROJECTS_QUERYResult;
}) {
  const { role } = useRBAC();

  console.log(role);
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Projects</h1>
      <Tabs defaultValue="in-progress">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="quoted">Quoted</TabsTrigger>
          </TabsList>
          <Button asChild className="sm:w-auto" variant="default">
            <Link href="/projects/create" className="my-2 flex items-center">
              <PlusCircleIcon className="h-5 w-5 md:mr-2" />
              <span className="hidden sm:inline">Create New Project</span>
            </Link>
          </Button>
        </div>
        <TabsContent value="in-progress">
          {projects.length > 0 ? (
            <div className="mt-5">
              <DataTable data={projects} />
            </div>
          ) : (
            <NoProjectsPlaceholder />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
