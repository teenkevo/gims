"use client";

import {
  ArrowLeftCircle,
  CircleMinus,
  Download,
  EllipsisVerticalIcon,
  ExternalLink,
  FileText,
  PencilIcon,
  Trash,
  Trash2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import * as motion from "framer-motion/client";
import { DeleteProject } from "./delete-project";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectUpdateNameForm from "./project-update-name-form";
import ProjectUpdateDatesForm from "./project-update-dates-form";
import { QuotationOptions } from "../../billing/components/quotation-options";
import SampleReceiptVerification from "./sample-receipt-verifications";
import {
  ALL_CLIENTS_QUERYResult,
  ALL_CONTACTS_QUERYResult,
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../sanity.types";
import ClientNameForm from "./client-name-form";
import { ContactTable } from "./contact-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RemoveClientFromProject } from "./remove-client-from-project";
import { CreateClientDialog } from "./create-client-dialog";
import { DeleteFile } from "@/features/customer/services/components/test-methods/delete-test-method-file";
import mime from "mime-types";
import { BillingLifecycle } from "../../billing/components/billing-lifecycle";
import QuotationFile from "../../billing/components/quotation-file";

export default function ProjectDetails({
  project,
  existingContacts,
  existingClients,
  allServices,
}: {
  project: PROJECT_BY_ID_QUERYResult[number];
  existingContacts: ALL_CONTACTS_QUERYResult;
  existingClients: ALL_CLIENTS_QUERYResult;
  allServices: ALL_SERVICES_QUERYResult;
}) {
  const { _id, name, clients, contactPersons, startDate, endDate, quotation } = project;

  // ---------------------------------------------
  // 🔑  Derive stage indices **once** per render
  // ---------------------------------------------
  const statusStageMap: Record<
    "draft" | "sent" | "accepted" | "rejected" | "invoiced" | "paid",
    number
  > = {
    draft: 1,
    sent: 2,
    accepted: 3,
    rejected: 3,
    invoiced: 4,
    paid: 5,
  };

  const status = quotation?.status ?? "draft";
  const currentStage = statusStageMap[status] ?? 1;
  const rejectionStage = status === "rejected" ? currentStage : undefined;

  // billing services table states
  const [selectedLabTests, setSelectedLabTests] = useState<ALL_SERVICES_QUERYResult>([]);
  const [selectedFieldTests, setSelectedFieldTests] = useState<ALL_SERVICES_QUERYResult>([]);
  const [mobilizationActivities, setMobilizationActivities] = useState<
    { activity: string; price: number; quantity: number }[]
  >([]);
  const [reportingActivities, setReportingActivities] = useState<
    { activity: string; price: number; quantity: number }[]
  >([]);

  // State to manage the active tab
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  console.log(currentStage);

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/projects"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>
      <h1 className="text-2xl md:text-3xl font-extrabold mb-6">{name}</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger
            value="details"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "details");
              window.history.pushState({}, "", url);
            }}
          >
            Project
          </TabsTrigger>
          <TabsTrigger
            value="client"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "client");
              window.history.pushState({}, "", url);
            }}
          >
            Client
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "billing");
              window.history.pushState({}, "", url);
            }}
          >
            Billing
          </TabsTrigger>
          <TabsTrigger
            disabled
            value="sample-receipt"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "sample-receipt");
              window.history.pushState({}, "", url);
            }}
          >
            Sample Receipt
          </TabsTrigger>
          <TabsTrigger
            className="text-destructive data-[state=active]:text-destructive"
            value="danger"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", "danger");
              window.history.pushState({}, "", url);
            }}
          >
            <Trash2 strokeWidth={1.5} className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="space-y-8 my-10">
            <ProjectUpdateNameForm
              title="Project Name"
              description="Used to identify a project on the Dashboard"
              learnMoreLink="#"
              learnMoreText="Save"
              savable
              fieldName="name"
              initialValue={name || ""}
              projectId={_id}
            />
            <ProjectUpdateDatesForm
              title="Start and End Date"
              description="Used to track the progression and milestones of a project"
              learnMoreLink="#"
              learnMoreText="Save"
              savable={true}
              fieldName="dateRange"
              initialValue={{
                from: new Date(startDate ?? Date.now()),
                to: new Date(endDate ?? Date.now()),
              }}
              projectId={_id}
            />
          </div>
        </TabsContent>
        <TabsContent value="client">
          <div className="space-y-8 my-10">
            <AnimatePresence mode="popLayout">
              {/* Map through clients and filter contacts by client id */}
              {clients?.map((client, key) => {
                const clientContacts = contactPersons?.filter(
                  (contact) => contact.client?._id === client?._id
                );
                return (
                  <motion.div
                    key={client._id}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg p-4 md:p-6">
                      <div className="flex justify-between py-2">
                        <div className="md:flex items-center mb-6">
                          <div className="flex items-center justify-center w-[40px] h-[25px] bg-foreground text-primary-foreground mb-2 md:mb-0 mr-4">
                            {key + 1}
                          </div>
                          <p className="font-bold text-xl md:text-xl tracking-tight">
                            <span>{client.name}</span>
                          </p>
                        </div>
                        {clients.length > 1 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <span className="sr-only">Client actions</span>
                                <EllipsisVerticalIcon className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <RemoveClientFromProject
                                email={client?.name || ""}
                                projectId={_id || ""}
                                clientId={client?._id || ""}
                                clientName={client.name || ""}
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <ClientNameForm
                        title="Client Name"
                        initialValue={client?.name || ""}
                        clientId={client?._id || ""}
                        projectId={_id || ""}
                      />

                      <ContactTable
                        projectId={_id || ""}
                        clientId={client?._id || ""}
                        projectContacts={clientContacts || []}
                        existingContacts={existingContacts}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <CreateClientDialog
              projectId={_id || ""}
              existingClients={existingClients}
              projectClients={project.clients || []}
            />
          </div>
        </TabsContent>
        <TabsContent value="billing">
          <div className="space-y-8 my-10">
            <BillingLifecycle
              currentStage={currentStage}
              allServices={allServices}
              project={project}
              selectedLabTests={selectedLabTests}
              setSelectedLabTests={setSelectedLabTests}
              selectedFieldTests={selectedFieldTests}
              setSelectedFieldTests={setSelectedFieldTests}
              mobilizationActivities={mobilizationActivities}
              setMobilizationActivities={setMobilizationActivities}
              reportingActivities={reportingActivities}
              setReportingActivities={setReportingActivities}
            />
            {quotation && <QuotationFile quotation={quotation} />}
          </div>
        </TabsContent>
        <TabsContent value="sample-receipt">
          <div className="space-y-8 my-10">
            <SampleReceiptVerification />
          </div>
        </TabsContent>
        <TabsContent value="danger">
          <div className="space-y-8 my-10">
            <div className="bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg border-[1px] border-destructive/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-2">Delete Project</CardTitle>

                <CardDescription className="text-sm text-foregeound">
                  This project will be deleted, along with all of its Data, Files, Invoices and
                  Quotations. This action is irreversible and can not be undone.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mt-6 -mx-6 -mb-6 px-6 py-3 flex rounded-b-lg bg-muted/50 justify-end border-t items-center">
                  <DeleteProject name={name || ""} id={_id || ""} />
                </div>
              </CardContent>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
