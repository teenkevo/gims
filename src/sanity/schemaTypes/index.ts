import { type SchemaTypeDefinition } from "sanity";
import { project } from "./project";
import { client } from "./client";
import { contactPerson } from "./contact-person";
import { labTest } from "./lab-test";
import { standard } from "./standard";
import { testMethod } from "./test-method";
import { sampleClass } from "./sample-class";
import { fieldTest } from "./field-test";
import { personnel } from "./personnel";
import { equipment } from "./equipment";
import { maintenanceLog } from "./maintenance-log";
import { lab } from "./lab";
import { labApprovalWorkflow } from "./lab-approval-workflow";
import { rfi } from "./rfi";
import { clientFeedback } from "./clientFeedback";
import { feedbackAction } from "./feedbackAction";
import { service } from "./service";
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    standard, // CRUD ✅
    sampleClass, // CR ✅
    testMethod, // CR ✅
    labTest, // OMITTED FOR NOW ❌
    fieldTest, // OMITTED FOR NOW ❌
    service, // CRD ✅
    project, // CRUD ✅
    client, // CRUD ✅
    clientFeedback,
    feedbackAction,
    contactPerson, // CRUD ✅
    lab,
    personnel,
    equipment,
    maintenanceLog,
    labApprovalWorkflow,
    rfi,
  ],
};
