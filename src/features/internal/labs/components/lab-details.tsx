"use client";

import { ArrowLeftCircle, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ALL_EQUIPMENT_QUERY_RESULT,
  ALL_PERSONNEL_QUERY_RESULT,
  ALL_SERVICES_QUERY_RESULT,
  LAB_BY_ID_QUERY_RESULT,
} from "../../../../../sanity.types";
import { getLabSectionLabel, getSopCategoryLabel } from "../constants";
import { LabStatusBadge } from "./lab-status-badge";
import { DeleteLabDialog } from "./labs-table/row-actions/delete-lab-dialog";
import { LabUpdateNameForm } from "./lab-update-name-form";
import { LabUpdateIdentityForm } from "./lab-update-identity-form";
import { LabUpdateStaffingForm } from "./lab-update-staffing-form";
import { LabUpdateResourcesForm } from "./lab-update-resources-form";
import { LabUpdateAccreditationForm } from "./lab-update-accreditation-form";
import { LabUpdateProjectsForm } from "./lab-update-projects-form";
import { UnsavedChangesProvider } from "@/components/unsaved-changes/unsaved-changes-context";
import { UnsavedChangesDialog } from "@/components/unsaved-changes/unsaved-changes-dialog";
import { useGuardedTabChange } from "@/hooks/use-guarded-tab-change";

export default function LabDetails({
  lab,
  personnel,
  equipment,
  services,
}: {
  lab: LAB_BY_ID_QUERY_RESULT[number];
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
  services: ALL_SERVICES_QUERY_RESULT;
}) {
  return (
    <UnsavedChangesProvider>
      <LabDetailsContent
        lab={lab}
        personnel={personnel}
        equipment={equipment}
        services={services}
      />
    </UnsavedChangesProvider>
  );
}

function LabDetailsContent({
  lab,
  personnel,
  equipment,
  services,
}: {
  lab: LAB_BY_ID_QUERY_RESULT[number];
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
  services: ALL_SERVICES_QUERY_RESULT;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("laboratory");
  const [deleteOpen, setDeleteOpen] = useState(false);
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

    if (urlParams.get("registered") === "1") {
      toast.success("Laboratory registered successfully");
      const url = new URL(window.location.href);
      url.searchParams.delete("registered");
      router.replace(url.pathname + url.search);
    }
  }, [router]);

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/labs"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>

      <div className="mb-6">
        <Badge variant="outline" className="text-xs text-muted-foreground mb-2">
          <span className="font-bold">{lab.internalId}</span>
        </Badge>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-xl md:text-3xl font-extrabold">{lab.name}</h1>
          <LabStatusBadge status={lab.status} />
        </div>
        <p className="text-muted-foreground">
          {getLabSectionLabel(lab.labSection)}
          {lab.location ? ` · ${lab.location}` : ""}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={requestTabChange}>
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="laboratory">Laboratory</TabsTrigger>
          <TabsTrigger value="staffing">Staffing</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="projects">
            Projects{" "}
            <div className="ml-2 rounded-md border-dotted border h-6 w-6 border-muted-foreground text-primary">
              {lab.projects?.length ?? 0}
            </div>
          </TabsTrigger>
          <TabsTrigger value="sops">SOPs</TabsTrigger>
          <TabsTrigger
            className="text-destructive data-[state=active]:text-destructive"
            value="danger"
          >
            <Trash2 strokeWidth={1.5} className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="laboratory" className="mt-6">
          <div className="space-y-8">
            <LabUpdateNameForm initialValue={lab.name ?? ""} labId={lab._id} />
            <LabUpdateIdentityForm
              labId={lab._id}
              initialValues={{
                description: lab.description ?? "",
                labSection: lab.labSection ?? "",
                status: lab.status ?? "available",
                location: lab.location ?? "",
                capacity: lab.capacity?.toString() ?? "",
              }}
            />
            <LabUpdateAccreditationForm
              labId={lab._id}
              initialValues={{
                accreditationStandard:
                  lab.accreditation?.standard ?? "ISO 17025",
                accreditationCertificateNumber:
                  lab.accreditation?.certificateNumber ?? "",
                accreditationAccreditingBody:
                  lab.accreditation?.accreditingBody ?? "",
                accreditationExpiryDate: lab.accreditation?.expiryDate ?? "",
                notes: lab.notes ?? "",
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="staffing" className="mt-6">
          <LabUpdateStaffingForm
            labId={lab._id}
            personnel={personnel}
            assignedIds={(lab.personnel ?? []).map((p) => p._id)}
            labHeadId={lab.labHead?._id ?? ""}
          />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <LabUpdateResourcesForm
            labId={lab._id}
            equipment={equipment}
            services={services}
            assignedEquipmentIds={(lab.equipment ?? []).map((e) => e._id)}
            assignedTestCapabilityIds={(lab.testCapabilities ?? []).map(
              (s) => s._id
            )}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <LabUpdateProjectsForm
            labId={lab._id}
            projects={lab.projects ?? []}
          />
        </TabsContent>

        <TabsContent value="sops" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Operating Procedures</CardTitle>
              <CardDescription>
                Health, safety, and quality control documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(lab.sopDocuments ?? []).length > 0 ? (
                <div className="space-y-4">
                  {lab.sopDocuments?.map((sop) => (
                    <div
                      key={sop._key}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline">
                          {getSopCategoryLabel(sop.category)}
                        </Badge>
                        {sop.documentUrl && (
                          <a
                            href={sop.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            View document
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {sop.description && (
                        <p className="text-sm text-muted-foreground">
                          {sop.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No SOP documents on file. Add them via Sanity Studio.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-6">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanently remove this laboratory from the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
                Delete Laboratory
              </button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteLabDialog
        lab={{
          ...lab,
          projects: lab.projects ?? [],
        }}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={handleDialogOpenChange}
        onDiscard={confirmDiscard}
        onCancel={cancelDiscard}
      />
    </>
  );
}
