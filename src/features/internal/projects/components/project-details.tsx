"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import {
  FieldService,
  MobilizationService,
  ReportingService,
  Service,
} from "@/features/customer/services/data/schema";
// services data
import labTestsData from "@/features/customer/services/data/services.json";
import fieldTestsData from "@/features/customer/services/data/field_services.json";
import { DeleteProject } from "./delete-project";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoCard } from "@/components/info-card";
import CopyableInput from "./copyable-input";
import ProjectUpdateNameForm from "./project-update-name-form";
import ProjectUpdateDatesForm from "./project-update-dates-form";
import ProjectUpdateClientNameForm from "./project-update-client-name-form";
import ProjectUpdateClientEmailForm from "./project-update-client-email-form";
import ProjectUpdateClientPhoneForm from "./project-update-client-phone-form";
import ProjectStage from "./project-stage";
import { QuotationOptions } from "./quotation-options";
import SampleReceiptVerification from "./sample-receipt-verifications";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";

export default function ProjectDetails(
  project: PROJECT_BY_ID_QUERYResult[number]
) {
  const { _id, name, client, startDate, endDate } = project;

  // billing services table states

  const [coreFieldRowSelection, setCoreFieldRowSelection] = useState({});
  const [coreLabRowSelection, setCoreLabRowSelection] = useState({});

  const [labTestsTableData, setLabTestsTableData] =
    useState<Service[]>(labTestsData);
  const [fieldTestsTableData, setFieldTestsTableData] =
    useState<FieldService[]>(fieldTestsData);

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

      <div className="flex justify-between items-start mb-4">
        <div className="space-y-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">{name}</h1>
          <p className="text-base md:text-lg text-muted-foreground tracking-tight">
            {client?.name}
          </p>
        </div>
      </div>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Project Details</TabsTrigger>
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="sample-receipt">Sample Receipt</TabsTrigger>
          <TabsTrigger
            className="text-destructive data-[state=active]:text-destructive"
            value="danger"
          >
            Danger Zone
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
            <InfoCard
              title="Client ID"
              description="Used when interacting with GIMS' services and the API"
              learnMoreLink="#"
              savable={false}
            >
              <CopyableInput inputValue={client?._id || ""} />
            </InfoCard>
            <ProjectUpdateClientNameForm
              title="Client Name"
              description="Used to identify the client on the dashboard"
              learnMoreLink="#"
              learnMoreText="Save"
              savable
              fieldName="clientName"
              initialValue={client?.name || ""}
              clientId={client?._id || ""}
            />
            <ProjectUpdateClientEmailForm
              title="Client Email"
              description="Used to communicate with the client and send them updates about their projects"
              learnMoreLink="#"
              learnMoreText="Save"
              savable
              fieldName="clientEmail"
              initialValue={client?.email || ""}
              clientId={client?._id || ""}
            />
            <ProjectUpdateClientPhoneForm
              title="Client Phone"
              description="Used to communicate with the client over phone and SMS"
              learnMoreLink="#"
              learnMoreText="Save"
              savable
              fieldName="clientPhone"
              initialValue={client?.phone || ""}
              clientId={client?._id || ""}
            />
          </div>
        </TabsContent>
        <TabsContent value="billing">
          <div className="space-y-8 my-10">
            <QuotationOptions
              project={project}
              coreFieldRowSelection={coreFieldRowSelection}
              setCoreFieldRowSelection={setCoreFieldRowSelection}
              coreLabRowSelection={coreLabRowSelection}
              setCoreLabRowSelection={setCoreLabRowSelection}
              labTestsTableData={labTestsTableData}
              setLabTestsTableData={setLabTestsTableData}
              fieldTestsTableData={fieldTestsTableData}
              setFieldTestsTableData={setFieldTestsTableData}
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
