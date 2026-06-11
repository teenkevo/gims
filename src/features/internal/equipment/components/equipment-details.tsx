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
  ALL_PERSONNEL_QUERY_RESULT,
  EQUIPMENT_BY_ID_QUERY_RESULT,
} from "../../../../../sanity.types";
import {
  getEquipmentCategoryLabel,
  getMaintenanceTypeLabel,
} from "../constants";
import { EquipmentStatusBadge } from "./equipment-status-badge";
import { EditEquipmentForm } from "./edit-equipment-form";
import { DeleteEquipmentDialog } from "./equipment-table/row-actions/delete-equipment-dialog";

export default function EquipmentDetails({
  item,
  personnel,
}: {
  item: EQUIPMENT_BY_ID_QUERY_RESULT[number];
  personnel: ALL_PERSONNEL_QUERY_RESULT;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab) setActiveTab(tab);
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
        href="/equipment"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>

      <div className="mb-6">
        <Badge variant="outline" className="text-xs text-muted-foreground mb-2">
          <span className="font-bold">{item.internalId}</span>
        </Badge>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-xl md:text-3xl font-extrabold">{item.name}</h1>
          <EquipmentStatusBadge status={item.status} />
        </div>
        <p className="text-muted-foreground">
          {getEquipmentCategoryLabel(item.category)}
          {item.serialNumber ? ` · S/N ${item.serialNumber}` : ""}
          {item.manufacturer ? ` · ${item.manufacturer}` : ""}
          {item.model ? ` ${item.model}` : ""}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="labs">
            Laboratories ({item.labs?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger
            className="text-destructive data-[state=active]:text-destructive"
            value="danger"
          >
            <Trash2 strokeWidth={1.5} className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {item.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {item.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Last Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                {item.lastMaintenance
                  ? format(new Date(item.lastMaintenance), "dd MMM yyyy")
                  : "Not recorded"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                {item.nextMaintenance
                  ? format(new Date(item.nextMaintenance), "dd MMM yyyy")
                  : "Not scheduled"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigned Personnel</CardTitle>
              </CardHeader>
              <CardContent>
                {item.assignedPersonnel?.length ?? 0} assigned
              </CardContent>
            </Card>
          </div>

          {(item.supplier?.name || item.maintenanceCompany?.companyName) && (
            <Card>
              <CardHeader>
                <CardTitle>Vendor & Support</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                {item.supplier?.name && (
                  <div>
                    <p className="font-medium mb-1">Supplier</p>
                    <p>{item.supplier.name}</p>
                    {item.supplier.contactPerson && (
                      <p className="text-muted-foreground">
                        {item.supplier.contactPerson}
                      </p>
                    )}
                    {item.supplier.contactEmail && (
                      <p className="text-muted-foreground">
                        {item.supplier.contactEmail}
                      </p>
                    )}
                  </div>
                )}
                {item.maintenanceCompany?.companyName && (
                  <div>
                    <p className="font-medium mb-1">Maintenance Company</p>
                    <p>{item.maintenanceCompany.companyName}</p>
                    {item.maintenanceCompany.contactPerson && (
                      <p className="text-muted-foreground">
                        {item.maintenanceCompany.contactPerson}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(item.userManuals ?? []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>User Manuals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.userManuals?.map((url) => (
                  <a
                    key={url}
                    href={url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <EditEquipmentForm item={item} personnel={personnel} />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>
                Calibration, repair, and routine service records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(item.maintenanceLogs ?? []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Supervised By</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.maintenanceLogs?.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>
                          {log.date
                            ? format(new Date(log.date), "dd MMM yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {getMaintenanceTypeLabel(log.maintenanceType)}
                        </TableCell>
                        <TableCell>
                          {log.supervisedBy?.fullName ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {log.maintenanceNotes ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No maintenance logs on file. Add them via Sanity Studio.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Laboratories</CardTitle>
            </CardHeader>
            <CardContent>
              {(item.labs ?? []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lab ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Section</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.labs?.map((lab) => (
                      <TableRow key={lab._id}>
                        <TableCell>
                          <Link
                            href={`/labs/${lab._id}`}
                            className="font-medium hover:underline"
                          >
                            {lab.internalId}
                          </Link>
                        </TableCell>
                        <TableCell>{lab.name}</TableCell>
                        <TableCell>{lab.labSection}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not assigned to any laboratory.
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
                Permanently remove this equipment from the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
                Delete Equipment
              </button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteEquipmentDialog
        item={{ ...item, labs: item.labs ?? [] }}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
