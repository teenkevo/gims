"use client";

// core
import * as React from "react";

// types
import { ALL_PROJECTS_QUERYResult } from "../../../../../sanity.types";

// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// custom
import NoProjectsPlaceholder from "./no-projects-placeholder";
import ProjectCard from "./project-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";

export function ProjectsView({
  projects,
}: {
  projects: ALL_PROJECTS_QUERYResult;
}) {
  console.log(projects);
  return (
    <main className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-1 xl:grid-cols-1">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Tabs defaultValue="in-progress">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="quoted">Quoted</TabsTrigger>
            </TabsList>
            <Button asChild className="sm:w-auto" variant="default">
              <Link href="/projects/create" className="my-2">
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Create New Project
              </Link>
            </Button>
          </div>
          <TabsContent value="in-progress">
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 mt-5 lg:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project._id} {...project} />
                ))}
              </div>
            ) : (
              <NoProjectsPlaceholder />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
