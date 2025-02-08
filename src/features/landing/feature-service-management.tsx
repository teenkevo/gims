import * as React from "react";
import { z } from "zod";

import { columns } from "@/features/customer/services/components/services-table/columns";
import { serviceSchema } from "@/features/customer/services/data/schema";
import data from "@/features/customer/services/data/services.json";
import { DataTable } from "@/features/customer/services/components/services-table/data-table";

export function FeatureServiceManagement() {
  const services = z.array(serviceSchema).parse(data);
  return <DataTable data={services} columns={columns} />;
}
