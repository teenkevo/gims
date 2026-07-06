"use client";

import * as React from "react";
import {
  Briefcase,
  Building2,
  Cable,
  FileCheck2,
  FileStack,
  FileText,
  FlaskConical,
  LayoutList,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";

import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { ClientProfileSidebarLink } from "./client-profile-sidebar-link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { useRBAC } from "../rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, can, isAccessLoading, isClientUser } = useRBAC();

  const clientPortalNav = [
    {
      title: "Projects",
      url: "/projects",
      icon: FileStack,
      isActive: false,
      isDisabled: !can(PERMISSIONS["projects:read"]),
    },
    {
      title: "Contact Persons",
      url: "/contact-persons",
      icon: Users,
      isActive: false,
      isDisabled: false,
    },
    {
      title: "Requests for Information",
      url: "/requests-for-information",
      icon: FileText,
      isActive: false,
      isDisabled: !can(PERMISSIONS["rfi:read"]),
    },
  ];

  const organizationNav = [
    {
      title: "Departments",
      url: "/departments",
      icon: Building2,
      isDisabled:
        isAccessLoading || !can(PERMISSIONS["security:read"]),
    },
    {
      title: "Personnel",
      url: "/personnel",
      icon: Users,
      isDisabled: !can(PERMISSIONS["personnel:read"]),
    },
    {
      title: "Workflows",
      url: "/workflows",
      icon: FileCheck2,
      isDisabled: !can(PERMISSIONS["labs:read"]),
    },
  ];

  const projectsDeliveryNav = [
    {
      title: "Projects",
      url: "/projects",
      icon: FileStack,
      isDisabled: !can(PERMISSIONS["projects:read"]),
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Briefcase,
      isDisabled: !can(PERMISSIONS["clients:read"]),
    },
    {
      title: "Requests for Information",
      url: "/requests-for-information",
      icon: FileText,
      isDisabled: !can(PERMISSIONS["rfi:read"]),
    },
  ];

  const laboratoryOperationsNav = [
    {
      title: "Laboratories",
      url: "/labs",
      icon: FlaskConical,
      isDisabled: !can(PERMISSIONS["labs:read"]),
    },
    {
      title: "Services",
      url: "/services",
      icon: LayoutList,
      isDisabled: !can(PERMISSIONS["services:read"]),
    },
    {
      title: "Equipment",
      url: "/equipment",
      icon: Cable,
      isDisabled: !can(PERMISSIONS["equipment:read"]),
    },
  ];

  const systemNav = [
    {
      title: "Permission Sets",
      url: "/security?tab=roles",
      icon: ShieldCheck,
      isDisabled:
        isAccessLoading || !can(PERMISSIONS["security:read"]),
    },
  ];

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo icon={Rocket} name="GIMS by GETLAB" />
      </SidebarHeader>
      <SidebarContent aria-describedby={undefined}>
        {isClientUser ? (
          <>
            <ClientProfileSidebarLink />
            <NavGroup label="Client Portal" items={clientPortalNav} />
          </>
        ) : (
          <>
            <NavGroup label="Projects & delivery" items={projectsDeliveryNav} />
            <NavGroup label="Organization" items={organizationNav} />
            <NavGroup
              label="Laboratory operations"
              items={laboratoryOperationsNav}
            />
            <NavGroup label="System" items={systemNav} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
