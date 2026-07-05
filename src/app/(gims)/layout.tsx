import { Metadata } from "next";
import { Suspense } from "react";
import { BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ToggleLightDark } from "@/components/layout/toggle-light-dark";
import { Separator } from "@/components/ui/separator";
import NextBreadcrumb from "@/components/breadcrumbs";
import { AuthRBACProvider } from "@/components/auth/auth-rbac-provider";
import { AccessPendingBanner } from "@/components/auth/access-pending-banner";
import ContentLoading from "@/components/layout/content-loading";

export const metadata: Metadata = {
  title: "GIMS",
  description: "GETLAB Integrated Management System",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthRBACProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-auto">
          <header className="flex h-16 shrink-0 border-b border-muted items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <NextBreadcrumb
                homeElement={"Home"}
                separator={
                  <BreadcrumbSeparator className="text-foreground flex justify-center space-x-2 items-center" />
                }
                activeClasses="transition-all text-sm font-semibold text-primary mx-2"
                containerClasses="flex py-5"
                listClasses="transition-all text-sm font-semibold text-muted-foreground hover:text-foreground mx-2"
                capitalizeLinks
              />
            </div>
            <div className="px-4">
              <ToggleLightDark />
            </div>
          </header>
          <main className="p-4 md:pl-10 md:pr-10 md:pt-4">
            <AccessPendingBanner />
            <Suspense fallback={<ContentLoading />}>{children}</Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthRBACProvider>
  );
}
