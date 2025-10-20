"use client";

import { useEffect, useState } from "react";
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
  rfis,
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

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleUpdateRFI = (updatedRFI: ALL_RFIS_QUERYResult[number]) => {
    setSelectedRFI(updatedRFI);
  };

  useEffect(() => {
    if (selectedRFI && rfis) {
      const updatedRFI = rfis.find((rfi) => rfi._id === selectedRFI._id);
      if (updatedRFI) {
        setSelectedRFI(updatedRFI);
      }
    }
  }, [rfis, selectedRFI?._id]);

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
