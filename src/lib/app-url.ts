/**
 * Canonical public origin for invites, emails, and deep links.
 *
 * Prefer `NEXT_PUBLIC_APP_URL` (used by the Hono RPC client). `NEXT_PUBLIC_BASE_URL`
 * is accepted as an alias. On Vercel, production/preview hosts are used when those
 * are unset. Localhost is never used in production, even if an env file still has it.
 */
function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function toAbsoluteUrl(hostOrUrl: string) {
  const value = stripTrailingSlash(hostOrUrl.trim());
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `https://${value}`;
}

function isLocalhostUrl(url: string) {
  try {
    const { hostname } = new URL(toAbsoluteUrl(url));
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function getAppBaseUrl() {
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    const url = toAbsoluteUrl(value);
    if (isProd && isLocalhostUrl(url)) continue;
    return url;
  }

  return "http://localhost:3000";
}

export function getClerkSignUpRedirectUrl() {
  const path = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAppBaseUrl()}${normalized}`;
}
