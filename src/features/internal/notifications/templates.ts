import type { NotificationEventType, NotificationPayload } from "./events";
import { NOTIFICATION_EVENTS } from "./events";
import { GETLAB_BANK_PAYMENT_DETAILS } from "@/features/internal/billing/constants";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatMoney(amount?: number, currency?: string) {
  if (amount == null) return null;
  const code = (currency ?? "UGX").toUpperCase();
  return `${code} ${amount.toLocaleString()}`;
}

function eventLabel(type: NotificationEventType) {
  return NOTIFICATION_EVENTS.find((event) => event.type === type)?.label ?? type;
}

function named(
  name?: string,
  internalId?: string
): string | null {
  if (!name) return null;
  return internalId ? `${name} (${internalId})` : name;
}

type Template = {
  subject: string;
  text: string;
  html: string;
};

function linesFor(payload: NotificationPayload) {
  const lines: Array<[string, string]> = [];
  const project = named(payload.projectName, payload.projectInternalId);
  if (project) lines.push(["Project", project]);
  if (payload.invoiceNumber) lines.push(["Invoice", payload.invoiceNumber]);
  if (payload.quotationNumber) lines.push(["Quotation", payload.quotationNumber]);
  const total = formatMoney(payload.grandTotal, payload.currency);
  if (total) lines.push(["Amount", total]);
  const client = named(payload.clientName, payload.clientInternalId);
  if (client) lines.push(["Client", client]);
  if (payload.contactName) lines.push(["Contact", payload.contactName]);
  const lab = named(payload.labName, payload.labInternalId);
  if (lab) lines.push(["Laboratory", lab]);
  const equipment = named(payload.equipmentName, payload.equipmentInternalId);
  if (equipment) lines.push(["Equipment", equipment]);
  if (payload.rfiSubject) lines.push(["RFI", payload.rfiSubject]);
  if (payload.employeeName) lines.push(["Employee", payload.employeeName]);
  if (payload.status) lines.push(["Status", payload.status]);
  if (payload.detail) lines.push(["Details", payload.detail]);
  if (payload.actorName) lines.push(["By", payload.actorName]);
  return lines;
}

function subjectHint(payload: NotificationPayload) {
  return (
    payload.invoiceNumber ||
    payload.quotationNumber ||
    payload.projectName ||
    payload.clientName ||
    payload.labName ||
    payload.equipmentName ||
    payload.rfiSubject ||
    payload.employeeName ||
    payload.contactName
  );
}

export function renderNotificationEmail(
  type: NotificationEventType,
  payload: NotificationPayload
): Template {
  const title = eventLabel(type);
  const lines = linesFor(payload);
  const summary = lines.map(([label, value]) => `${label}: ${value}`).join("\n");
  const linkLine = payload.link ? `\nOpen in GIMS: ${payload.link}` : "";
  const hint = subjectHint(payload);

  const htmlRows = lines
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:6px 12px 6px 0;color:#667085;font-size:14px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:6px 0;color:#101828;font-size:14px;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  const htmlLink = payload.link
    ? `<p style="margin:24px 0 0;">
        <a href="${escapeHtml(payload.link)}" style="display:inline-block;background:#101828;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;">
          Open in GIMS
        </a>
      </p>`
    : "";

  const attachmentLine = payload.attachmentNote
    ? `\n${payload.attachmentNote}`
    : "";
  const htmlAttachment = payload.attachmentNote
    ? `<p style="margin:16px 0 0;color:#344054;font-size:14px;">${escapeHtml(payload.attachmentNote)}</p>`
    : "";

  return {
    subject: hint ? `${title}: ${hint}` : title,
    text: `${title}\n\n${summary}${attachmentLine}${linkLine}\n`.trim(),
    html: `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f2f4f7;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e7ec;border-radius:12px;padding:24px;">
      <p style="margin:0 0 4px;color:#667085;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;">GIMS notification</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:#101828;">${escapeHtml(title)}</h1>
      <table style="border-collapse:collapse;">${htmlRows}</table>
      ${htmlAttachment}
      ${htmlLink}
    </div>
  </body>
</html>`,
  };
}

export type CustomerQuotationEmailInput = {
  contactName: string;
  quotationNumber?: string;
  projectName?: string;
  projectInternalId?: string;
  grandTotal?: number;
  currency?: string;
  portalUrl?: string;
  hasAttachment: boolean;
};

export type CustomerDocumentEmailInput = {
  contactName: string;
  documentNumber?: string;
  quotationNumber?: string;
  projectName?: string;
  projectInternalId?: string;
  grandTotal?: number;
  currency?: string;
  portalUrl?: string;
  payUrl?: string;
  advancePercentage?: number;
  paymentNotes?: string;
  hasAttachment: boolean;
};

export function renderCustomerQuotationEmail(
  input: CustomerQuotationEmailInput
): Template {
  return renderCustomerDocumentEmail("quotation", {
    contactName: input.contactName,
    documentNumber: input.quotationNumber,
    quotationNumber: input.quotationNumber,
    projectName: input.projectName,
    projectInternalId: input.projectInternalId,
    grandTotal: input.grandTotal,
    currency: input.currency,
    portalUrl: input.portalUrl,
    hasAttachment: input.hasAttachment,
  });
}

export function renderCustomerInvoiceEmail(
  input: CustomerDocumentEmailInput
): Template {
  return renderCustomerDocumentEmail("invoice", input);
}

function paymentInstructions(input: CustomerDocumentEmailInput): {
  text: string;
  html: string;
} {
  const bank = GETLAB_BANK_PAYMENT_DETAILS;
  const total = formatMoney(input.grandTotal, input.currency);
  const advancePercentage = input.advancePercentage ?? 0;
  const requiresAdvance = advancePercentage > 0;
  const advanceAmount =
    input.grandTotal != null
      ? formatMoney((input.grandTotal * advancePercentage) / 100, input.currency)
      : null;
  const remainderPercentage = 100 - advancePercentage;
  const remainderAmount =
    input.grandTotal != null
      ? formatMoney(
          input.grandTotal - (input.grandTotal * advancePercentage) / 100,
          input.currency
        )
      : null;

  const dueLine = requiresAdvance
    ? `Pay ${advancePercentage}%${advanceAmount ? ` (${advanceAmount})` : ""} before the project starts.${remainderAmount ? ` The remaining ${remainderPercentage}% (${remainderAmount}) is due as agreed.` : ""}`
    : `No advance payment is required. Please pay the invoice total${total ? ` of ${total}` : ""}.`;

  const notes = input.paymentNotes?.trim();
  const bankLines = [
    ["Account name", bank.accountName],
    ["Bank", bank.bank],
    ["Branch", bank.branch],
    ["Account number", bank.accountNumber],
    ["SWIFT code", bank.swiftCode],
  ];
  const bankText = bankLines
    .map(([rowLabel, value]) => `${rowLabel}: ${value}`)
    .join("\n");
  const bankHtml = bankLines
    .map(
      ([rowLabel, value]) =>
        `<tr>
          <td style="padding:4px 12px 4px 0;color:#667085;font-size:13px;vertical-align:top;">${escapeHtml(rowLabel)}</td>
          <td style="padding:4px 0;color:#101828;font-size:13px;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  const advanceBanner = requiresAdvance
    ? `<p style="margin:0 0 12px;padding:12px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;color:#92400e;font-size:14px;line-height:1.5;"><strong>Advance payment required.</strong> ${escapeHtml(dueLine)}</p>`
    : `<p style="margin:0 0 12px;color:#344054;font-size:14px;line-height:1.5;">${escapeHtml(dueLine)}</p>`;

  const notesHtml = notes
    ? `<p style="margin:12px 0 0;color:#344054;font-size:14px;line-height:1.5;"><strong>Payment instructions:</strong> ${escapeHtml(notes)}</p>`
    : "";
  const notesText = notes ? `\nPayment instructions: ${notes}` : "";

  const payHref = input.payUrl ?? input.portalUrl;
  const payHtml = payHref
    ? `<p style="margin:16px 0 0;">
        <a href="${escapeHtml(payHref)}" style="display:inline-block;background:#101828;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;">
          Upload payment evidence
        </a>
      </p>
      <p style="margin:8px 0 0;color:#667085;font-size:13px;line-height:1.5;">After you pay, use this button to upload your proof of payment in the GETLAB client portal.</p>`
    : "";
  const payText = payHref
    ? `\nUpload payment evidence: ${payHref}`
    : "";

  return {
    text: `How to pay
${dueLine}

1. Transfer the amount due using the GETLAB bank details below.
2. Upload your payment evidence in the client portal.

Bank payment details
${bankText}${notesText}${payText}`,
    html: `<div style="margin:20px 0 0;padding:16px;background:#f9fafb;border:1px solid #e4e7ec;border-radius:8px;">
      <p style="margin:0 0 12px;color:#667085;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;">How to pay</p>
      ${advanceBanner}
      <p style="margin:0 0 12px;color:#344054;font-size:14px;line-height:1.5;">Transfer the amount due using the GETLAB bank details below, then upload your payment evidence.</p>
      <p style="margin:0 0 6px;color:#101828;font-size:14px;font-weight:600;">Bank payment details</p>
      <table style="border-collapse:collapse;">${bankHtml}</table>
      ${notesHtml}
      ${payHtml}
    </div>`,
  };
}

function renderCustomerDocumentEmail(
  kind: "quotation" | "invoice",
  input: CustomerDocumentEmailInput
): Template {
  const isInvoice = kind === "invoice";
  const greeting = input.contactName ? `Dear ${input.contactName},` : "Dear customer,";
  const project = named(input.projectName, input.projectInternalId);
  const documentNumber =
    input.documentNumber ??
    (isInvoice ? "your invoice" : "your quotation");
  const amount = formatMoney(input.grandTotal, input.currency);
  const label = isInvoice ? "Invoice" : "Quotation";
  const projectHint = project ? ` — ${input.projectName}` : "";

  const subject = input.documentNumber
    ? `${label} ${input.documentNumber}${projectHint}`
    : `Your GETLAB ${isInvoice ? "invoice" : "quotation"}${projectHint}`;

  const attachLine = input.hasAttachment
    ? `Please find the ${isInvoice ? "invoice" : "quotation"} PDF attached to this email.`
    : `Please review the ${isInvoice ? "invoice" : "quotation"} in the GETLAB client portal.`;

  const intro = isInvoice
    ? `Thank you for accepting${input.quotationNumber ? ` quotation ${input.quotationNumber}` : " the quotation"}. GETLAB has issued invoice ${documentNumber} for your records.`
    : `GETLAB has issued quotation ${documentNumber} for your review.`;

  const payment = isInvoice ? paymentInstructions(input) : null;
  const ctaHref = isInvoice ? (input.payUrl ?? input.portalUrl) : input.portalUrl;
  const cta = isInvoice ? "Upload payment evidence" : "Review quotation";

  const lines: Array<[string, string]> = [];
  if (isInvoice && input.documentNumber) {
    lines.push(["Invoice", input.documentNumber]);
  }
  if (input.quotationNumber) lines.push(["Quotation", input.quotationNumber]);
  if (project) lines.push(["Project", project]);
  if (amount) lines.push([isInvoice ? "Invoice total" : "Amount", amount]);
  if (isInvoice && (input.advancePercentage ?? 0) > 0 && input.grandTotal != null) {
    const advanceDue = formatMoney(
      (input.grandTotal * (input.advancePercentage ?? 0)) / 100,
      input.currency
    );
    if (advanceDue) {
      lines.push([
        `Advance due now (${input.advancePercentage}%)`,
        advanceDue,
      ]);
    }
  }

  const summary = lines.map(([rowLabel, value]) => `${rowLabel}: ${value}`).join("\n");
  const htmlRows = lines
    .map(
      ([rowLabel, value]) =>
        `<tr>
          <td style="padding:6px 12px 6px 0;color:#667085;font-size:14px;vertical-align:top;">${escapeHtml(rowLabel)}</td>
          <td style="padding:6px 0;color:#101828;font-size:14px;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  const htmlLink =
    !isInvoice && ctaHref
      ? `<p style="margin:24px 0 0;">
        <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:#101828;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;">
          ${escapeHtml(cta)}
        </a>
      </p>`
      : "";
  const linkLine = !isInvoice && ctaHref ? `\n${cta}: ${ctaHref}` : "";
  const paymentText = payment ? `\n\n${payment.text}` : "";

  return {
    subject,
    text: `${greeting}

${intro}

${attachLine}

${summary}${paymentText}${linkLine}

If you have questions, email info@getlab.co.ug or call +256 752 972309.

Kind regards,
Geotechnical Engineering and Technology Laboratory (GETLAB) Limited
www.getlab.co.ug`.trim(),
    html: `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f2f4f7;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e7ec;border-radius:12px;padding:24px;">
      <p style="margin:0 0 4px;color:#667085;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;">GETLAB</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:#101828;">${escapeHtml(label)} ${escapeHtml(documentNumber)}</h1>
      <p style="margin:0 0 16px;color:#344054;font-size:14px;line-height:1.5;">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 16px;color:#344054;font-size:14px;line-height:1.5;">${escapeHtml(intro)} ${escapeHtml(attachLine)}</p>
      <table style="border-collapse:collapse;">${htmlRows}</table>
      ${payment?.html ?? ""}
      ${htmlLink}
      <p style="margin:24px 0 0;color:#667085;font-size:13px;line-height:1.5;">
        Questions? Email <a href="mailto:info@getlab.co.ug" style="color:#101828;">info@getlab.co.ug</a>
        or call +256 752 972309.
      </p>
      <p style="margin:16px 0 0;color:#667085;font-size:13px;line-height:1.5;">
        Kind regards,<br/>
        Geotechnical Engineering and Technology Laboratory (GETLAB) Limited<br/>
        <a href="https://www.getlab.co.ug" style="color:#101828;">www.getlab.co.ug</a>
      </p>
    </div>
  </body>
</html>`,
  };
}
