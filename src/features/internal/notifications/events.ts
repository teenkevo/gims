export const NOTIFICATION_MODULE_IDS = [
  "projects",
  "clients",
  "billing",
  "rfi",
  "leave",
  "labs",
  "equipment",
] as const;

export type NotificationModuleId = (typeof NOTIFICATION_MODULE_IDS)[number];

export type NotificationModule = {
  id: NotificationModuleId;
  label: string;
  description: string;
};

export const NOTIFICATION_MODULES: NotificationModule[] = [
  {
    id: "projects",
    label: "Projects",
    description: "New jobs, sample receipts, and work orders.",
  },
  {
    id: "clients",
    label: "Clients",
    description: "Client records and contact persons.",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Quotations and invoices.",
  },
  {
    id: "rfi",
    label: "RFIs",
    description: "Requests for information and conversation updates.",
  },
  {
    id: "leave",
    label: "Leave",
    description: "Leave plan submissions and reviews.",
  },
  {
    id: "labs",
    label: "Laboratories",
    description: "Lab registration and status changes.",
  },
  {
    id: "equipment",
    label: "Equipment",
    description: "Equipment added to the inventory.",
  },
];

export const NOTIFICATION_EVENT_TYPES = [
  "project.created",
  "sample.receipt.submitted",
  "sample.receipt.approved",
  "sample.receipt.acknowledged",
  "work.order.created",
  "work.order.issued",
  "client.created",
  "contact.created",
  "quotation.created",
  "quotation.sent",
  "quotation.accepted",
  "quotation.rejected",
  "quotation.revisions_requested",
  "invoice.issued",
  "rfi.created",
  "rfi.message.added",
  "rfi.resolved",
  "leave.plan.submitted",
  "leave.plan.approved",
  "leave.plan.changes_requested",
  "leave.session.approved",
  "lab.created",
  "lab.status.updated",
  "equipment.created",
] as const;

export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPES)[number];

export type NotificationEventDefinition = {
  type: NotificationEventType;
  module: NotificationModuleId;
  label: string;
  description: string;
};

export const NOTIFICATION_EVENTS: NotificationEventDefinition[] = [
  {
    type: "project.created",
    module: "projects",
    label: "Project created",
    description: "A new project is registered.",
  },
  {
    type: "sample.receipt.submitted",
    module: "projects",
    label: "Sample receipt submitted",
    description: "A sample receipt is sent for GETLAB approval.",
  },
  {
    type: "sample.receipt.approved",
    module: "projects",
    label: "Sample receipt approved",
    description: "GETLAB approves a sample receipt and sends it to the client.",
  },
  {
    type: "sample.receipt.acknowledged",
    module: "projects",
    label: "Sample receipt acknowledged",
    description: "The client acknowledges a sample receipt.",
  },
  {
    type: "work.order.created",
    module: "projects",
    label: "Work order drafted",
    description: "A work order is created as a draft.",
  },
  {
    type: "work.order.issued",
    module: "projects",
    label: "Work order issued",
    description: "A work order is sent to the laboratory.",
  },
  {
    type: "client.created",
    module: "clients",
    label: "Client created",
    description: "A new client organisation is added.",
  },
  {
    type: "contact.created",
    module: "clients",
    label: "Contact person created",
    description: "A contact person is added to a client.",
  },
  {
    type: "quotation.created",
    module: "billing",
    label: "Quotation created",
    description:
      "A new quotation draft is created for a project. The quotation PDF is attached.",
  },
  {
    type: "quotation.sent",
    module: "billing",
    label: "Quotation sent",
    description:
      "A quotation is sent to the client. The PDF is attached internally, and a customer-facing email is sent to the project's contact persons.",
  },
  {
    type: "quotation.accepted",
    module: "billing",
    label: "Quotation accepted",
    description: "The client accepts a quotation.",
  },
  {
    type: "quotation.rejected",
    module: "billing",
    label: "Quotation rejected",
    description: "The client rejects a quotation.",
  },
  {
    type: "quotation.revisions_requested",
    module: "billing",
    label: "Quotation revisions requested",
    description: "The client asks GETLAB to revise a quotation.",
  },
  {
    type: "invoice.issued",
    module: "billing",
    label: "Invoice issued",
    description:
      "An invoice PDF is issued after a quotation is accepted. The invoice is emailed to the client and to subscribed GETLAB departments.",
  },
  {
    type: "rfi.created",
    module: "rfi",
    label: "RFI created",
    description: "A new request for information is opened.",
  },
  {
    type: "rfi.message.added",
    module: "rfi",
    label: "RFI message added",
    description: "Someone posts a message on an RFI.",
  },
  {
    type: "rfi.resolved",
    module: "rfi",
    label: "RFI resolved",
    description: "An RFI is marked resolved.",
  },
  {
    type: "leave.plan.submitted",
    module: "leave",
    label: "Leave plan submitted",
    description: "An employee submits their annual leave plan.",
  },
  {
    type: "leave.plan.approved",
    module: "leave",
    label: "Leave plan approved",
    description: "A leave plan is approved.",
  },
  {
    type: "leave.plan.changes_requested",
    module: "leave",
    label: "Leave changes requested",
    description: "A reviewer asks for changes on a leave plan.",
  },
  {
    type: "leave.session.approved",
    module: "leave",
    label: "Leave session approved",
    description: "An individual leave session is approved.",
  },
  {
    type: "lab.created",
    module: "labs",
    label: "Laboratory created",
    description: "A new laboratory is registered.",
  },
  {
    type: "lab.status.updated",
    module: "labs",
    label: "Laboratory status updated",
    description: "A lab’s status or identity details change.",
  },
  {
    type: "equipment.created",
    module: "equipment",
    label: "Equipment created",
    description: "A piece of equipment is added to the inventory.",
  },
];

export const NOTIFICATION_EVENT_OPTIONS = NOTIFICATION_EVENTS.map((event) => ({
  title: `${NOTIFICATION_MODULES.find((module) => module.id === event.module)?.label}: ${event.label}`,
  value: event.type,
}));

export function isNotificationEventType(
  value: string
): value is NotificationEventType {
  return (NOTIFICATION_EVENT_TYPES as readonly string[]).includes(value);
}

export function eventsForModule(moduleId: NotificationModuleId) {
  return NOTIFICATION_EVENTS.filter((event) => event.module === moduleId);
}

export function notificationSubscriptionId(eventType: NotificationEventType) {
  return `notification-subscription-${eventType.replaceAll(".", "-")}`;
}

export type NotificationPayload = {
  projectId?: string;
  projectName?: string;
  projectInternalId?: string;
  quotationId?: string;
  quotationNumber?: string;
  invoiceNumber?: string;
  grandTotal?: number;
  currency?: string;
  clientId?: string;
  clientName?: string;
  clientInternalId?: string;
  contactName?: string;
  labId?: string;
  labName?: string;
  labInternalId?: string;
  equipmentId?: string;
  equipmentName?: string;
  equipmentInternalId?: string;
  rfiId?: string;
  rfiSubject?: string;
  employeeName?: string;
  status?: string;
  detail?: string;
  actorName?: string;
  link?: string;
  attachmentFileId?: string;
  attachmentFilename?: string;
  attachmentNote?: string;
};

export type NotificationRecipient = {
  email: string;
  fullName: string;
};
