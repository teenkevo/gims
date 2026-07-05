"use client";

import { ArrowLeftCircle, PlusCircleIcon, Trash2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import * as motion from "framer-motion/client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CLIENT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import ClientUpdateNameForm from "./client-update-name-form";
import { DataTable } from "./contacts-table/data-table";
import { DataTable as ProjectsDataTable } from "./projects-table/data-table";
import { CreateContactDialog } from "./create-contact-dialog";
import { Badge } from "@/components/ui/badge";
import { DeleteClient } from "./delete-client";
import { Button } from "@/components/ui/button";
import NoProjectsForClientPlaceholder from "./no-projects-for-client-placeholder";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Can } from "@/components/auth/can";
import { UnsavedChangesProvider } from "@/components/unsaved-changes/unsaved-changes-context";
import { UnsavedChangesDialog } from "@/components/unsaved-changes/unsaved-changes-dialog";
import { useGuardedTabChange } from "@/hooks/use-guarded-tab-change";

export default function ClientDetails({
  client,
}: {
  client: CLIENT_BY_ID_QUERY_RESULT[number];
}) {
  return (
    <UnsavedChangesProvider>
      <ClientDetailsContent client={client} />
    </UnsavedChangesProvider>
  );
}

function ClientDetailsContent({
  client,
}: {
  client: CLIENT_BY_ID_QUERY_RESULT[number];
}) {
  const { _id, internalId, name, projects, contacts } = client;
  const { can } = useRBAC();
  const canUpdateClient = can(PERMISSIONS["clients:update"]);
  const canDeleteClient = can(PERMISSIONS["clients:delete"]);

  // State to manage the active tab
  const [activeTab, setActiveTab] = useState("client_profile");
  const {
    requestTabChange,
    showUnsavedDialog,
    handleDialogOpenChange,
    confirmDiscard,
    cancelDiscard,
  } = useGuardedTabChange(activeTab, setActiveTab);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/clients"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>
      <div className="mb-6">
        <Badge variant="outline" className="text-xs text-muted-foreground mb-2">
          <span className="font-bold">{internalId}</span>
        </Badge>
        <h1 className="text-xl md:text-3xl font-extrabold mb-6">{name}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={requestTabChange}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="client_profile">Client Profile</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>

            {canDeleteClient && (
              <TabsTrigger
                className="text-destructive data-[state=active]:text-destructive"
                value="danger"
              >
                <Trash2 strokeWidth={1.5} className="w-5 h-5" />
              </TabsTrigger>
            )}
          </TabsList>
          {projects.length > 0 && activeTab === "projects" && (
            <Can permission={PERMISSIONS["projects:create"]}>
              <Button asChild className="sm:w-auto" variant="default">
                <Link
                  href={`/clients/${_id}/projects/create?client=${encodeURIComponent(name ?? "")}`}
                  className=" flex items-center"
                >
                  <PlusCircleIcon className="h-5 w-5 md:mr-2" />
                  <span className="hidden sm:inline">Create New Project</span>
                </Link>
              </Button>
            </Can>
          )}
        </div>

        <TabsContent value="client_profile">
          <div className="space-y-8 my-5">
            <AnimatePresence mode="popLayout">
              {/* Map through clients and filter contacts by client id */}

              <motion.div
                key={_id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col gap-10">
                  <ClientUpdateNameForm
                    title="Client Name"
                    description="Used to identify a client in the system"
                    learnMoreLink="#"
                    learnMoreText="Save"
                    savable={canUpdateClient}
                    fieldName="clientName"
                    initialValue={name || ""}
                    clientId={_id}
                    unsavedChangesId="client-name"
                  />
                  <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg p-4 md:p-6">
                    <div className="flex mb-5 justify-between items-center">
                      <p className="text-xl font-bold">Contact Persons</p>
                      <Can permission={PERMISSIONS["clients:update"]}>
                        <CreateContactDialog clientId={_id} />
                      </Can>
                    </div>
                    <DataTable data={contacts} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </TabsContent>
        <TabsContent value="projects">
          {projects.length > 0 ? (
            <div className="mt-5">
              <ProjectsDataTable data={projects} client={client} />
            </div>
          ) : (
            <NoProjectsForClientPlaceholder
              helperText="projects"
              needAction
              clientId={client._id}
              clientName={name ?? ""}
            />
          )}
        </TabsContent>

        <TabsContent value="danger">
          {canDeleteClient && (
            <div className="space-y-8 my-10">
              <div className="bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg border-[1px] border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold mb-2">
                    Delete Client
                  </CardTitle>

                  <CardDescription className="text-sm text-foregeound">
                    This client will be deleted, along with all of their Data,
                    Files, Invoices and Quotations. This action is irreversible
                    and can not be undone.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mt-6 -mx-6 -mb-6 px-6 py-3 flex rounded-b-lg bg-muted/50 justify-end border-t items-center">
                    <DeleteClient client={client} />
                  </div>
                </CardContent>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={handleDialogOpenChange}
        onDiscard={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
  );
}
