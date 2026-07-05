"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Container, NotepadText } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRBAC } from "@/components/rbac-context";

export function ClientProfileSidebarLink() {
  const pathname = usePathname();
  const { clientName } = useRBAC();
  const isActive =
    pathname === "/my-client-profile" ||
    pathname.startsWith("/my-client-profile/");

  return (
    <SidebarGroup className="pb-0">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              isActive={isActive}
              className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
            >
              <Link href="/my-client-profile">
                <div className="flex aspect-square size-8 items-center justify-center border border-foreground/10 rounded-lg">
                  <Container strokeWidth={0.5} className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Client Profile</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {clientName ?? "Client organization"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
