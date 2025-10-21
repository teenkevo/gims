"use client";

import { Button } from "@/components/ui/button";
import { SampleVerificationDrawer } from "./sample-verification-drawer";
import {
  PROJECT_BY_ID_QUERYResult,
  ALL_PERSONNEL_QUERYResult,
} from "../../../../../sanity.types";

export default function SampleReceiptVerification({
  project,
  personnel,
}: {
  project: PROJECT_BY_ID_QUERYResult[number];
  personnel: ALL_PERSONNEL_QUERYResult;
}) {
  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sample Receipt Verification</h1>
        <SampleVerificationDrawer project={project} personnel={personnel}>
          <Button size="sm" className="shadow-md">
            Open Verification Form
          </Button>
        </SampleVerificationDrawer>
      </div>
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Click the button above to open the sample receipt verification form.
        </p>
      </div>
    </div>
  );
}
