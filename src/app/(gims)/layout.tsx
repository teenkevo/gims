import { Metadata } from "next";
import { BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import NextBreadcrumb from "@/components/breadcrumbs";

//TODO: work on per page metadata below, this layout is shared
export const metadata: Metadata = {
  title: "GIMS",
  description: "GIMS pages that don't share a layout with the home page", //TODO: work on meta description
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-auto">
        <header className="flex h-16 shrink-0 border-b border-muted items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <NextBreadcrumb
              homeElement={"Home"}
              separator={
                <BreadcrumbSeparator className="text-foreground flex justify-center space-x-2 items-center" />
              }
              activeClasses="transition-all text-sm font-semibold text-foreground mx-2"
              containerClasses="flex py-5"
              listClasses="transition-all text-sm font-semibold text-muted-foreground hover:text-foreground mx-2"
              capitalizeLinks
            />
          </div>
        </header>
        <main className="p-4 md:pl-10 md:pr-10 md:pt-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
