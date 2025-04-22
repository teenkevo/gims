"use client";

import {
  ArrowLeftCircle,
  CircleMinus,
  EllipsisVerticalIcon,
  PencilIcon,
  Trash2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import * as motion from "framer-motion/client";
import {
  FieldService,
  MobilizationService,
  ReportingService,
  Service,
} from "@/features/customer/services/data/schema";
import { DeleteProject } from "./delete-project";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoCard } from "@/components/info-card";
import CopyableInput from "./copyable-input";
import ProjectUpdateNameForm from "./project-update-name-form";
import ProjectUpdateDatesForm from "./project-update-dates-form";
import ProjectStage from "./project-stage";
import { QuotationOptions } from "../../billing/components/quotation-options";
import SampleReceiptVerification from "./sample-receipt-verifications";
import {
  ALL_CLIENTS_QUERYResult,
  ALL_CONTACTS_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../sanity.types";
import ClientNameForm from "./client-name-form";
import { ContactTable } from "./contact-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RemoveClientFromProject } from "./remove-client-from-project";
import { CreateClientDialog } from "./create-client-dialog";
export default function ProjectDetails({
  project,
  existingContacts,
  existingClients,
}: {
  project: PROJECT_BY_ID_QUERYResult[number];
  existingContacts: ALL_CONTACTS_QUERYResult;
  existingClients: ALL_CLIENTS_QUERYResult;
}) {
  const { _id, name, clients, contactPersons, startDate, endDate } = project;

  // billing services table states
  const [selectedLabTests, setSelectedLabTests] = useState<Service[]>([]);
  const [selectedFieldTests, setSelectedFieldTests] = useState<FieldService[]>(
    []
  );
  const [mobilizationActivity, setMobilizationActivity] =
    useState<MobilizationService>({
      activity: "",
      price: 0,
      quantity: 0,
    });
  const [reportingActivity, setReportingActivity] = useState<ReportingService>({
    activity: "",
    price: 0,
    quantity: 0,
  });

  // State to manage the active tab
  const [activeTab, setActiveTab] = useState("details");

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
        className="mb-10 inline-flex tracking-tight underline underline-offset-4"
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
            <InfoCard
              title="Project Stage"
              description=""
              learnMoreLink="#"
              savable={false}
            >
              <ProjectStage {...project} />
              <p className=" text-xs my-2 text-muted-foreground">
                Hover to jump to stage
              </p>
            </InfoCard>
            {/* <InfoCard
              title="Project ID"
              description="Used when interacting with GIMS' services and the API"
              learnMoreLink="#"
              savable={false}
            >
              <CopyableInput inputValue={_id} />
            </InfoCard> */}
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
                const clientContacts = contactPersons?.filter((contact) =>
                  contact.clients?.some((c) => c._id === client?._id)
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
                        projectId={_id}
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
            <QuotationOptions
              project={project}
              selectedLabTests={selectedLabTests}
              setSelectedLabTests={setSelectedLabTests}
              selectedFieldTests={selectedFieldTests}
              setSelectedFieldTests={setSelectedFieldTests}
              mobilizationActivity={mobilizationActivity}
              setMobilizationActivity={setMobilizationActivity}
              reportingActivity={reportingActivity}
              setReportingActivity={setReportingActivity}
            />
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
                <CardTitle className="text-xl font-bold mb-2">
                  Delete Project
                </CardTitle>

                <CardDescription className="text-sm text-foregeound">
                  This project will be deleted, along with all of its Data,
                  Files, Invoices and Quotations. This action is irreversible
                  and can not be undone.
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
