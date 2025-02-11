"use client";

import { ArrowLeftCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
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
import ProjectUpdateClientNameForm from "./project-update-client-name-form";
import ProjectUpdateClientEmailForm from "./project-update-client-email-form";
import ProjectUpdateClientPhoneForm from "./project-update-client-phone-form";
import ProjectStage from "./project-stage";
import { QuotationOptions } from "../../billing/components/quotation-options";
import SampleReceiptVerification from "./sample-receipt-verifications";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import ClientNameForm from "./client-name-form";
import { ContactTable } from "./contact-table";

export default function ProjectDetails(
  project: PROJECT_BY_ID_QUERYResult[number]
) {
  const { _id, name, clients, startDate, endDate } = project;

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

  return (
    <>
      <Link className="mb-10 inline-flex" href="/projects">
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{name}</h1>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Project</TabsTrigger>
          <TabsTrigger value="client">Client(s)</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="sample-receipt">Sample Receipt</TabsTrigger>
          <TabsTrigger
            className="text-destructive data-[state=active]:text-destructive"
            value="danger"
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
            <InfoCard
              title="Project ID"
              description="Used when interacting with GIMS' services and the API"
              learnMoreLink="#"
              savable={false}
            >
              <CopyableInput inputValue={_id} />
            </InfoCard>
            <ProjectUpdateNameForm
              title="Project Name"
              description="Used to identify your Project on the Dashboard"
              learnMoreLink="#"
              learnMoreText="Save"
              savable
              fieldName="name"
              initialValue={name || ""}
              projectId={_id}
            />
            <ProjectUpdateDatesForm
              title="Start and End Date"
              description="Used to track the progression of your project"
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
            {clients?.map((client, key) => (
              <Card className="border rounded-lg p-5" key={client._id}>
                <p className="text-xl font-bold mb-4">
                  Client {clients.length > 1 ? key + 1 : ""}{" "}
                </p>
                <ClientNameForm
                  title="Client Name"
                  savable={true}
                  fieldName="name"
                  initialValue={client?.name || ""}
                  clientId={client?._id || ""}
                />
                <ContactTable contacts={[]} isSubmitting={false} />
              </Card>
            ))}
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
            <Card className="border-[1px] border-destructive/20">
              <CardHeader>
                <CardTitle className="text-2xl">Delete Project</CardTitle>
                <CardDescription>
                  This project will be deleted, along with all of its Data,
                  Files, Invoices and Quotations. This action is irreversible
                  and can not be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteProject name={name || ""} id={_id || ""} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
