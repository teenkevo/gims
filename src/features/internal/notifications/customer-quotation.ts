import "server-only";

import {
  getAppBaseUrl,
  getEmailRedirect,
  getResendClient,
  getResendCustomerFrom,
} from "@/lib/email/resend";
import type { EmailAttachment } from "./attachments";
import {
  renderCustomerInvoiceEmail,
  renderCustomerQuotationEmail,
} from "./templates";

export type QuotationContact = {
  name: string;
  email: string;
  clientId?: string;
};

export type QuotationEmailContext = {
  quotationId: string;
  quotationNumber?: string;
  grandTotal?: number;
  currency?: string;
  projectId?: string;
  projectName?: string;
  projectInternalId?: string;
  fileId?: string;
  fileOriginalFilename?: string;
  invoiceFileId?: string;
  invoiceOriginalFilename?: string;
  advance?: number;
  paymentNotes?: string;
  contacts: QuotationContact[];
  clients: Array<{ _id: string; name?: string }>;
};

export function invoiceNumberFromQuotation(quotationNumber?: string) {
  if (!quotationNumber) return undefined;
  return quotationNumber.replace("Q", "INV");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function portalUrlForContact(
  contact: QuotationContact,
  context: QuotationEmailContext,
  search?: string
) {
  const clientId = contact.clientId ?? context.clients[0]?._id;
  if (!context.projectId || !clientId) return undefined;
  const path = `${getAppBaseUrl()}/clients/${clientId}/projects/${context.projectId}`;
  return search ? `${path}?${search}` : path;
}

function renderCustomerEmail(
  kind: "quotation" | "invoice",
  contact: QuotationContact,
  context: QuotationEmailContext,
  hasAttachment: boolean
) {
  const portalUrl = portalUrlForContact(contact, context);
  if (kind === "invoice") {
    return renderCustomerInvoiceEmail({
      contactName: contact.name,
      documentNumber: invoiceNumberFromQuotation(context.quotationNumber),
      quotationNumber: context.quotationNumber,
      projectName: context.projectName,
      projectInternalId: context.projectInternalId,
      grandTotal: context.grandTotal,
      currency: context.currency,
      portalUrl,
      payUrl: portalUrlForContact(contact, context, "pay=1"),
      advancePercentage: context.advance,
      paymentNotes: context.paymentNotes,
      hasAttachment,
    });
  }

  return renderCustomerQuotationEmail({
    contactName: contact.name,
    quotationNumber: context.quotationNumber,
    projectName: context.projectName,
    projectInternalId: context.projectInternalId,
    grandTotal: context.grandTotal,
    currency: context.currency,
    portalUrl,
    hasAttachment,
  });
}

export async function sendCustomerQuotationEmails(
  context: QuotationEmailContext,
  attachments?: EmailAttachment[]
) {
  await sendCustomerDocumentEmails(context, attachments, "quotation");
}

export async function sendCustomerInvoiceEmails(
  context: QuotationEmailContext,
  attachments?: EmailAttachment[]
) {
  await sendCustomerDocumentEmails(context, attachments, "invoice");
}

async function sendCustomerDocumentEmails(
  context: QuotationEmailContext,
  attachments: EmailAttachment[] | undefined,
  kind: "quotation" | "invoice"
) {
  const label = kind === "invoice" ? "invoice" : "quotation";
  const contacts = context.contacts.filter((contact) => contact.email);
  if (contacts.length === 0) {
    console.warn(
      `Customer ${label} email skipped: quotation ${context.quotationId} has no contact emails`
    );
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    console.info(
      `Customer ${label} email skipped: RESEND_API_KEY is not set`
    );
    return;
  }

  const redirectTo = getEmailRedirect();
  if (process.env.NODE_ENV !== "production" && !redirectTo) {
    console.info(
      `Customer ${label} email skipped: set EMAIL_REDIRECT in development so mail is not sent to clients.`
    );
    return;
  }

  const from = getResendCustomerFrom();
  const hasAttachment = Boolean(attachments?.length);

  if (redirectTo) {
    const intended = contacts
      .map((contact) => `${contact.name} <${contact.email}>`)
      .join(", ");
    const email = renderCustomerEmail(
      kind,
      contacts[0],
      context,
      hasAttachment
    );
    const banner = `Customer ${label} email. Intended for: ${intended}`;
    const { error } = await resend.emails.send({
      from,
      to: redirectTo,
      subject: `[dev] ${email.subject}`,
      html: `<p style="margin:0 0 16px;padding:12px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;color:#92400e;font-size:13px;">${escapeHtml(banner)}</p>${email.html}`,
      text: `${banner}\n\n${email.text}`,
      attachments,
    });
    if (error) {
      throw error;
    }
    return;
  }

  const results = await Promise.allSettled(
    contacts.map(async (contact) => {
      const email = renderCustomerEmail(
        kind,
        contact,
        context,
        hasAttachment
      );
      const { error } = await resend.emails.send({
        from,
        to: contact.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        attachments,
      });
      if (error) {
        throw error;
      }
    })
  );

  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    console.error(
      `Customer ${label} email: ${failed.length} of ${contacts.length} emails failed`,
      failed
    );
  }
}
