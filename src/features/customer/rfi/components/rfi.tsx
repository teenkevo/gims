"use client";

import { useState } from "react";
import { RFIList } from "./rfi-list";
import { RFIDetail } from "./rfi-detail";
import { CreateRFIDialog } from "./create-rfi-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ALL_CLIENTS_QUERYResult,
  ALL_PERSONNEL_QUERYResult,
  ALL_RFIS_QUERYResult,
} from "../../../../../sanity.types";

export default function RFIModule({
  rfis: b,
  labPersonnel,
  clients,
}: {
  rfis: ALL_RFIS_QUERYResult;
  labPersonnel: ALL_PERSONNEL_QUERYResult;
  clients: ALL_CLIENTS_QUERYResult;
}) {
  const [selectedRFI, setSelectedRFI] = useState<
    ALL_RFIS_QUERYResult[number] | null
  >(null);
  const [rfis, setRFIs] = useState<ALL_RFIS_QUERYResult>(b);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateRFI = (
    newRFI: Omit<ALL_RFIS_QUERYResult[number], "_id" | "dateSubmitted">
  ) => {
    const rfi: ALL_RFIS_QUERYResult[number] = {
      _id: `rfi-${Date.now()}`,
      initiationType: newRFI.initiationType,
      project: newRFI.project
        ? {
            _id: newRFI.project._id,
            name: newRFI.project.name,
            internalId: newRFI.project.internalId,
          }
        : null,
      client: newRFI.client
        ? {
            _id: newRFI.client._id,
            name: newRFI.client.name,
            internalId: newRFI.client.internalId,
          }
        : null,
      subject: newRFI.subject,
      description: newRFI.description,
      status: newRFI.status,
      dateSubmitted: new Date().toISOString(),
      dateResolved: newRFI.dateResolved || null,
      attachments: newRFI.attachments || [],
      conversation: newRFI.conversation || [],
      labInitiator: newRFI.labInitiator
        ? {
            _id: newRFI.labInitiator._id,
            fullName: newRFI.labInitiator.fullName,
            email: newRFI.labInitiator.email,
            phone: newRFI.labInitiator.phone,
            departmentRoles: newRFI.labInitiator.departmentRoles || null,
          }
        : null,
      labReceiver: newRFI.labReceiver
        ? {
            _id: newRFI.labReceiver._id,
            fullName: newRFI.labReceiver.fullName,
            email: newRFI.labReceiver.email,
            phone: newRFI.labReceiver.phone,
            departmentRoles: newRFI.labReceiver.departmentRoles || null,
          }
        : null,
      labInitiatorExternal: newRFI.labInitiatorExternal
        ? {
            _id: newRFI.labInitiatorExternal._id,
            fullName: newRFI.labInitiatorExternal.fullName,
            email: newRFI.labInitiatorExternal.email,
            phone: newRFI.labInitiatorExternal.phone,
            departmentRoles:
              newRFI.labInitiatorExternal.departmentRoles || null,
          }
        : null,
      clientReceiver: newRFI.clientReceiver
        ? {
            _id: newRFI.clientReceiver._id,
            name: newRFI.clientReceiver.name,
            email: newRFI.clientReceiver.email,
            phone: newRFI.clientReceiver.phone,
            designation: newRFI.clientReceiver.designation,
          }
        : null,
      clientInitiator: newRFI.clientInitiator
        ? {
            _id: newRFI.clientInitiator._id,
            name: newRFI.clientInitiator.name,
            email: newRFI.clientInitiator.email,
            phone: newRFI.clientInitiator.phone,
            designation: newRFI.clientInitiator.designation,
          }
        : null,
      labReceiverExternal: newRFI.labReceiverExternal
        ? {
            _id: newRFI.labReceiverExternal._id,
            fullName: newRFI.labReceiverExternal.fullName,
            email: newRFI.labReceiverExternal.email,
            phone: newRFI.labReceiverExternal.phone,
            departmentRoles: newRFI.labReceiverExternal.departmentRoles || null,
          }
        : null,
    };
    setRFIs((prev) => [rfi, ...prev]);
    setShowCreateDialog(false);
  };

  const handleUpdateRFI = (updatedRFI: ALL_RFIS_QUERYResult[number]) => {
    setRFIs((prev) =>
      prev.map((rfi) => (rfi._id === updatedRFI._id ? updatedRFI : rfi))
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
          <CreateRFIDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onCreateRFI={handleCreateRFI}
            labPersonnel={labPersonnel}
            clients={clients}
          />
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
                <RFIDetail
                  rfi={selectedRFI as ALL_RFIS_QUERYResult[number]}
                  onUpdateRFI={handleUpdateRFI}
                />
              ) : (
                <div className="hidden md:flex items-center justify-center h-full text-muted-foreground">
                  Select an RFI to view details
                </div>
              )}
            </div>
          </div>
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
