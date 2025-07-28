"use client";

import { useState } from "react";
import { RFIList } from "./rfi-list";
import { RFIDetail } from "./rfi-detail";
import { CreateRFIDialog } from "./create-rfi-dialog";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import type { RFI } from "../types/rfi.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockRFIs: RFI[] = [
  {
    id: "rfi-001",
    initiationType: "internal_external",
    project: { id: "proj-1", name: "Downtown Foundation Analysis" },
    client: { id: "client-1", name: "Metro Construction Corp" },
    subject: "Clarification on Soil Bearing Capacity Requirements",
    description:
      "We need clarification on the required soil bearing capacity for the foundation design. The initial geotechnical report indicates 3000 psf, but the structural drawings suggest 4000 psf is needed.",
    status: "in_progress",
    dateSubmitted: "2024-01-15T10:30:00Z",
    labInitiatorExternal: {
      id: "lab-1",
      name: "Dr. Sarah Johnson",
      role: "Senior Geotechnical Engineer",
    },
    clientReceiver: {
      id: "contact-1",
      name: "Mike Chen",
      role: "Project Manager",
    },
    conversation: [
      {
        id: "msg-1",
        message:
          "Hi Mike, we've reviewed the structural drawings and noticed a discrepancy in the required bearing capacity. Can you confirm the correct value?",
        sentByClient: false,
        labSender: { id: "lab-1", name: "Dr. Sarah Johnson" },
        timestamp: "2024-01-15T14:20:00Z",
        attachments: ["foundation-analysis.pdf"],
      },
      {
        id: "msg-2",
        message:
          "Thanks Sarah. Let me check with the structural engineer and get back to you by tomorrow.",
        sentByClient: true,
        clientSender: { id: "contact-1", name: "Mike Chen" },
        timestamp: "2024-01-15T16:45:00Z",
        attachments: [],
      },
    ],
    attachments: ["geotechnical-report-v1.pdf", "structural-drawings.dwg"],
  },
  {
    id: "rfi-002",
    initiationType: "external_internal",
    project: { id: "proj-2", name: "Highway Bridge Soil Testing" },
    client: { id: "client-2", name: "State DOT" },
    subject: "Additional Testing Requirements for Bridge Abutments",
    description:
      "The state inspector is requesting additional SPT tests at the bridge abutment locations. Can you provide a revised testing schedule?",
    status: "open",
    dateSubmitted: "2024-01-16T09:15:00Z",
    clientInitiator: {
      id: "contact-2",
      name: "Jennifer Walsh",
      role: "State Inspector",
    },
    labReceiverExternal: {
      id: "lab-2",
      name: "Robert Kim",
      role: "Field Operations Manager",
    },
    conversation: [],
    attachments: ["inspection-notes.pdf"],
  },
  {
    id: "rfi-003",
    initiationType: "internal_internal",
    project: { id: "proj-1", name: "Downtown Foundation Analysis" },
    subject: "Lab Equipment Calibration Schedule",
    description:
      "Need to coordinate the triaxial testing equipment calibration with the project timeline.",
    status: "resolved",
    dateSubmitted: "2024-01-10T11:00:00Z",
    dateResolved: "2024-01-12T15:30:00Z",
    labInitiator: {
      id: "lab-3",
      name: "Maria Rodriguez",
      role: "Lab Technician",
    },
    labReceiver: { id: "lab-4", name: "David Park", role: "QA Manager" },
    conversation: [
      {
        id: "msg-3",
        message:
          "The triaxial equipment needs calibration before we can proceed with the foundation samples.",
        sentByClient: false,
        labSender: { id: "lab-3", name: "Maria Rodriguez" },
        timestamp: "2024-01-10T11:00:00Z",
        attachments: [],
      },
      {
        id: "msg-4",
        message:
          "Calibration scheduled for tomorrow morning. Equipment will be ready by 2 PM.",
        sentByClient: false,
        labSender: { id: "lab-4", name: "David Park" },
        timestamp: "2024-01-11T08:30:00Z",
        attachments: ["calibration-schedule.pdf"],
      },
    ],
    attachments: [],
  },
];

export default function RFIModule() {
  const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null);
  const [rfis, setRFIs] = useState<RFI[]>(mockRFIs);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateRFI = (newRFI: Omit<RFI, "id" | "dateSubmitted">) => {
    const rfi: RFI = {
      ...newRFI,
      id: `rfi-${Date.now()}`,
      dateSubmitted: new Date().toISOString(),
    };
    setRFIs((prev) => [rfi, ...prev]);
    setShowCreateDialog(false);
  };

  const handleUpdateRFI = (updatedRFI: RFI) => {
    setRFIs((prev) =>
      prev.map((rfi) => (rfi.id === updatedRFI.id ? updatedRFI : rfi))
    );
    setSelectedRFI(updatedRFI);
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Requests for Information
      </h1>
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <Button className="my-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Create New RFI</span>
          </Button>
        </div>
        <TabsContent className="border p-2" value="all">
          <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Mobile: Show list OR detail, Desktop: Show both */}
            <div
              className={`${selectedRFI ? "hidden md:block" : "block"} w-full md:w-1/3 border-r flex flex-col h-full`}
            >
              <RFIList
                rfis={rfis}
                selectedRFI={selectedRFI}
                onSelectRFI={setSelectedRFI}
              />
            </div>
            <div
              className={`${selectedRFI ? "block" : "hidden md:block"} w-full md:flex-1 flex flex-col h-full overflow-hidden`}
            >
              {selectedRFI ? (
                <RFIDetail rfi={selectedRFI} onUpdateRFI={handleUpdateRFI} />
              ) : (
                <div className="hidden md:flex items-center justify-center h-full text-muted-foreground">
                  Select an RFI to view details
                </div>
              )}
            </div>
          </div>

          <CreateRFIDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onCreateRFI={handleCreateRFI}
          />
        </TabsContent>
      </Tabs>

      <div className="border-b">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            {selectedRFI && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSelectedRFI(null)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
