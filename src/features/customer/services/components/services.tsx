import * as React from "react";
import { z } from "zod";

import { columns } from "./services-table/columns";
import { serviceSchema } from "../data/schema";
import data from "../data/services.json";
import { DataTable } from "./services-table/data-table";

export function Services() {
  const services = z.array(serviceSchema).parse(data);
  return (
    <main className="grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
        <h1 className="text-4xl">Services</h1>
        <DataTable data={services} columns={columns} />
      </div>
    </main>
  );
}
