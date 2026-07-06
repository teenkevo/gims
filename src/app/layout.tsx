import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Spline_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/query-provider";
import { SanityLive } from "@/sanity/lib/live";
import ScrollToTop from "@/components/scroll-to-top";
import { ClerkProvider } from "@/components/auth/clerk-provider";

export const metadata: Metadata = {
  title: "GIMS by GETLAB",
  description: "GETLAB Integrated Management System",
};

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const splineSans = Spline_Sans({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Next .js already supports this field
  viewportFit: "cover",
  // `shrinkToFit` isn’t part of the spec anymore, so skip it
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      // style={{ scrollBehavior: "smooth" }}
      lang="en"
      suppressHydrationWarning
    >
      <body className={`${splineSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <QueryProvider>
              <ScrollToTop />
              {children}
              <SanityLive />
            </QueryProvider>
          </ClerkProvider>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
