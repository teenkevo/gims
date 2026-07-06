"use client";

import type { CLIENT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import { DataTable as ContactsDataTable } from "./contacts-table/data-table";

export function ContactPersonsPortalView({
  client,
}: {
  client: CLIENT_BY_ID_QUERY_RESULT[number];
}) {
  const { name, contacts } = client;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-extrabold md:text-3xl">Contact Persons</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          All contact persons for {name}
        </p>
      </div>

      <ContactsDataTable data={contacts} />
    </div>
  );
}
