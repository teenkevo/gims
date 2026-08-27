/**
 * Public origin for invites, emails, and deep links.
 * Uses `NEXT_PUBLIC_APP_URL` only.
 */
function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export function getAppBaseUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!value) return "http://localhost:3000";
  const url = stripTrailingSlash(value);
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

export function getClerkSignUpRedirectUrl() {
  const path = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAppBaseUrl()}${normalized}`;
}
