"use client";

// core
import * as React from "react";

// types
import { ALL_CLIENTS_QUERYResult } from "../../../../../sanity.types";

// components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// custom
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircleIcon } from "lucide-react";
import { DataTable } from "./clients-table/data-table";

export function ClientsView({ clients }: { clients: ALL_CLIENTS_QUERYResult }) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Clients</h1>
      <Tabs defaultValue="in-progress">
        <div className="flex items-center justify-between">
          <Button asChild className="sm:w-auto" variant="default">
            <Link href="/clients/create" className="my-2 flex items-center">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              <span>Add New Client</span>
            </Link>
          </Button>
        </div>
        <TabsContent value="in-progress">
          {clients.length > 0 ? (
            <div className="mt-5">
              <DataTable data={clients} />
            </div>
          ) : (
            <p>No clients found</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
