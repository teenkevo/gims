import "server-only";

import { Resend } from "resend";

export { getAppBaseUrl } from "@/lib/app-url";

/**
 * Internal notification mailer.
 *
 * Required:
 *   RESEND_API_KEY
 * Optional:
 *   RESEND_FROM_EMAIL  e.g. `GIMS <notifications@getlab.co.ug>`
 *   EMAIL_REDIRECT     if set, every notification and customer email is sent
 *                      here instead of personnel or client inboxes. Use this
 *                      in development.
 *   NEXT_PUBLIC_APP_URL   used for deep links in notification emails
 */
export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export function getResendFrom() {
  return process.env.RESEND_FROM_EMAIL ?? "GIMS <notifications@getlab.co.ug>";
}

/** Customer-facing mail uses the same verified domain, with a GETLAB display name. */
export function getResendCustomerFrom() {
  if (process.env.RESEND_FROM_CUSTOMER_EMAIL) {
    return process.env.RESEND_FROM_CUSTOMER_EMAIL;
  }

  const from = getResendFrom();
  const angle = from.match(/<([^>]+)>/);
  if (angle) {
    return `GETLAB <${angle[1]}>`;
  }
  return `GETLAB <${from}>`;
}

export function getEmailRedirect() {
  const redirect = process.env.EMAIL_REDIRECT?.trim();
  return redirect || null;
}
