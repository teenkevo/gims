"use client";

import { AnimatePresence } from "framer-motion";
import * as motion from "framer-motion/client";
import type { CLIENT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import ClientUpdateNameForm from "./client-update-name-form";
import { DataTable as ContactsDataTable } from "./contacts-table/data-table";
import { Badge } from "@/components/ui/badge";
import { UnsavedChangesProvider } from "@/components/unsaved-changes/unsaved-changes-context";

export function ClientProfilePortalView({
  client,
}: {
  client: CLIENT_BY_ID_QUERY_RESULT[number];
}) {
  return (
    <UnsavedChangesProvider>
      <ClientProfilePortalContent client={client} />
    </UnsavedChangesProvider>
  );
}

function ClientProfilePortalContent({
  client,
}: {
  client: CLIENT_BY_ID_QUERY_RESULT[number];
}) {
  const { _id, internalId, name, contacts } = client;

  return (
    <div className="space-y-12">
      <div>
        <Badge variant="outline" className="mb-2 text-xs text-muted-foreground">
          <span className="font-bold">{internalId}</span>
        </Badge>
        <h1 className="text-xl font-extrabold md:text-3xl">{name}</h1>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-bold">Client Profile</h2>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={_id}
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col gap-10">
              <ClientUpdateNameForm
                title="Client Name"
                description="Your organization name in the system"
                savable={false}
                fieldName="clientName"
                initialValue={name || ""}
                clientId={_id}
              />
              <div className="rounded-lg border bg-gradient-to-b from-muted/20 to-muted/40 p-4 md:p-6">
                <p className="mb-5 text-xl font-bold">Contact Persons</p>
                <ContactsDataTable data={contacts} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
