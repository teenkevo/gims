"use client";

import { ArrowLeftCircle, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ALL_EQUIPMENT_QUERY_RESULT,
  ALL_PERSONNEL_QUERY_RESULT,
  ALL_SERVICES_QUERY_RESULT,
  LAB_BY_ID_QUERY_RESULT,
} from "../../../../../sanity.types";
import { getLabSectionLabel, getSopCategoryLabel } from "../constants";
import { LabStatusBadge } from "./lab-status-badge";
import { EditLabForm } from "./edit-lab-form";
import { DeleteLabDialog } from "./labs-table/row-actions/delete-lab-dialog";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  const setTab = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url);
  };

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

      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="projects">
            Projects ({lab.projects?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="sops">SOPs</TabsTrigger>
          <TabsTrigger
            className="text-destructive data-[state=active]:text-destructive"
            value="danger"
          >
            <Trash2 strokeWidth={1.5} className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {lab.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {lab.description}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lab Head</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{lab.labHead?.fullName ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {lab.labHead?.internalId}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {lab.capacity ? `${lab.capacity} workstations` : "Not set"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {lab.personnel?.length ?? 0} assigned
                </p>
              </CardContent>
            </Card>
          </div>

          {lab.accreditation && (
            <Card>
              <CardHeader>
                <CardTitle>Accreditation</CardTitle>
                <CardDescription>
                  Laboratory quality system certification
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Standard: </span>
                  {lab.accreditation.standard ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Certificate: </span>
                  {lab.accreditation.certificateNumber ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Body: </span>
                  {lab.accreditation.accreditingBody ?? "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">Expires: </span>
                  {lab.accreditation.expiryDate
                    ? format(
                        new Date(lab.accreditation.expiryDate),
                        "dd MMM yyyy"
                      )
                    : "—"}
                </div>
              </CardContent>
            </Card>
          )}

          {lab.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Operational Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {lab.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <EditLabForm
            lab={lab}
            personnel={personnel}
            equipment={equipment}
            services={services}
          />
        </TabsContent>

        <TabsContent value="resources" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Personnel</CardTitle>
              <CardDescription>
                Technicians and officers working in this laboratory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(lab.personnel ?? []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lab.personnel?.map((person) => (
                      <TableRow key={person._id}>
                        <TableCell className="font-medium">
                          {person.internalId}
                        </TableCell>
                        <TableCell>{person.fullName}</TableCell>
                        <TableCell>
                          {person.departmentRoles?.[0]?.role ?? "—"}
                        </TableCell>
                        <TableCell>
                          {person.departmentRoles?.[0]?.department
                            ?.department ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No personnel assigned.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              {(lab.equipment ?? []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Maintenance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lab.equipment?.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.serialNumber}</TableCell>
                        <TableCell className="capitalize">
                          {item.status?.replace(/_/g, " ") ?? "—"}
                        </TableCell>
                        <TableCell>
                          {item.nextMaintenance
                            ? format(
                                new Date(item.nextMaintenance),
                                "dd MMM yyyy"
                              )
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No equipment assigned.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Capabilities</CardTitle>
              <CardDescription>
                Accredited test methods available in this laboratory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(lab.testCapabilities ?? []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Test Parameter</TableHead>
                      <TableHead>Methods</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lab.testCapabilities?.map((test) => (
                      <TableRow key={test._id}>
                        <TableCell className="font-medium">
                          {test.code}
                        </TableCell>
                        <TableCell>{test.testParameter}</TableCell>
                        <TableCell>
                          {test.testMethods?.length ?? 0} method
                          {(test.testMethods?.length ?? 0) !== 1 ? "s" : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No test capabilities configured.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Projects</CardTitle>
              <CardDescription>
                Projects currently routed through this laboratory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(lab.projects ?? []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lab.projects?.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell>
                          <Link
                            href={`/projects/${project._id}`}
                            className="font-medium hover:underline"
                          >
                            {project.internalId}
                          </Link>
                        </TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          {project.endDate
                            ? format(new Date(project.endDate), "dd MMM yyyy")
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No projects assigned to this laboratory.
                </p>
              )}
            </CardContent>
          </Card>
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
    </>
  );
}
