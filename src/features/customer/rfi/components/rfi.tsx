"use client";

import { useEffect, useState } from "react";
import { RFIList } from "./rfi-list";
import { RFIDetail } from "./rfi-detail";
import { CreateRFIDialog } from "./create-rfi-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowLeftCircle, Link } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("all");

  // Filter RFIs by status
  const openRFIs = rfis.filter((rfi) => rfi.status === "open");
  const inProgressRFIs = rfis.filter((rfi) => rfi.status === "in_progress");
  const resolvedRFIs = rfis.filter((rfi) => rfi.status === "resolved");

  // Handle tab change and reset selected RFI
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedRFI(null); // Reset selected RFI when switching tabs
  };

  const handleUpdateRFI = (updatedRFI: ALL_RFIS_QUERYResult[number]) => {
    setSelectedRFI(updatedRFI);
  };

  const handleDeleteRFI = () => {
    setSelectedRFI(null);
  };

  useEffect(() => {
    if (selectedRFI && rfis) {
      const updatedRFI = rfis.find((rfi) => rfi._id === selectedRFI._id);
      if (updatedRFI) {
        setSelectedRFI(updatedRFI);
      }
    }
  }, [rfis, selectedRFI?._id]);

  // Helper function to render RFI list and detail view
  const renderRFIContent = (filteredRFIs: ALL_RFIS_QUERYResult) => (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile: Show list OR detail, Desktop: Show both */}
      <div
        className={`${selectedRFI ? "hidden lg:block" : "block"} w-full lg:w-1/2 xl:w-1/3 md:border-r flex flex-col h-full`}
      >
        {filteredRFIs && filteredRFIs.length > 0 ? (
          <RFIList
            rfis={filteredRFIs}
            selectedRFI={selectedRFI}
            onSelectRFI={setSelectedRFI}
          />
        ) : (
          <div className="hidden lg:flex items-center justify-center h-full text-muted-foreground">
            No RFIs found
          </div>
        )}
      </div>
      <div
        className={`${selectedRFI ? "block" : "hidden md:block"} w-full lg:flex-1 flex flex-col h-full overflow-hidden`}
      >
        {selectedRFI ? (
          <RFIDetail
            rfi={selectedRFI as ALL_RFIS_QUERYResult[number]}
            onUpdateRFI={handleUpdateRFI}
            onDeleteRFI={handleDeleteRFI}
            onBackToList={() => setSelectedRFI(null)}
          />
        ) : (
          <div className="hidden md:flex items-center justify-center h-full text-muted-foreground">
            Select an RFI to view details
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Requests for Information
      </h1>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <CreateRFIDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            labPersonnel={labPersonnel}
            clients={clients}
          />
        </div>
        <TabsContent className="md:border md:p-2 p-0" value="all">
          {renderRFIContent(rfis)}
        </TabsContent>
        <TabsContent className="md:border md:p-2 p-0" value="open">
          {renderRFIContent(openRFIs)}
        </TabsContent>
        <TabsContent className="md:border md:p-2 p-0" value="in-progress">
          {renderRFIContent(inProgressRFIs)}
        </TabsContent>
        <TabsContent className="md:border md:p-2 p-0" value="resolved">
          {renderRFIContent(resolvedRFIs)}
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
