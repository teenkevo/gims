export interface RFI {
  id: string;
  initiationType:
    | "internal_internal"
    | "internal_external"
    | "external_internal";
  project?: { id: string; name: string };
  client?: { id: string; name: string };
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  dateSubmitted: string;
  dateResolved?: string;
  attachments: string[];
  conversation: ConversationMessage[];

  // Internal to Internal
  labInitiator?: Personnel;
  labReceiver?: Personnel;

  // Internal to External
  labInitiatorExternal?: Personnel;
  clientReceiver?: ContactPerson;

  // External to Internal
  clientInitiator?: ContactPerson;
  labReceiverExternal?: Personnel;
}

export interface ConversationMessage {
  id: string;
  message: string;
  sentByClient: boolean;
  clientSender?: ContactPerson;
  labSender?: Personnel;
  timestamp: string;
  attachments: string[];
}

export interface Personnel {
  id: string;
  name: string;
  role?: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  client: { id: string; name: string };
  contactPersons: ContactPerson[];
}

export interface Client {
  id: string;
  name: string;
  contactPersons: ContactPerson[];
}
