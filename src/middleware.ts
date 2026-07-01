import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/studio(.*)",
  "/monitoring(.*)",
  "/sentry-example-page(.*)",
  "/api/revalidate(.*)",
  "/api/sentry-example-api(.*)",
]);

const isProtectedApiRoute = createRouteMatcher([
  "/api/projects(.*)",
  "/api/clients(.*)",
  "/api/upload(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const ticket = request.nextUrl.searchParams.get("__clerk_ticket");

  // Invitation links must hit sign-up so Clerk can complete registration / set password.
  if (ticket && !request.nextUrl.pathname.startsWith("/sign-up")) {
    const signUpUrl = new URL("/sign-up", request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
      signUpUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(signUpUrl);
  }

  if (isPublicRoute(request)) {
    return;
  }

  if (isProtectedApiRoute(request) || !request.nextUrl.pathname.startsWith("/api")) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
