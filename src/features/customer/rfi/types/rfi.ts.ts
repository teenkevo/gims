export interface RFI {
  id: string;
  rfiManager: Personnel;
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
  labReceivers?: Personnel[];

  // Internal to External
  labInitiatorExternal?: Personnel;
  clientReceivers?: ContactPerson[];

  // External to Internal
  clientInitiator?: ContactPerson;
  labReceiversExternal?: Personnel[];
}

export interface ConversationMessage {
  id: string;
  message: string;
  sentByClient: boolean;
  clientSender?: ContactPerson;
  labSender?: Personnel;
  timestamp: string;
  attachments: string[];

  // New multiple recipient support
  recipients?: MessageRecipient[];
  ccRecipients?: MessageRecipient[];
}

export interface MessageRecipient {
  type: "lab" | "client";
  personnel?: Personnel;
  contactPerson?: ContactPerson;
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
