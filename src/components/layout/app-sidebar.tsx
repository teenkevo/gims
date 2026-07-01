"use client";

import * as React from "react";
import {
  Briefcase,
  Cable,
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

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { ToggleLightDark } from "./toggle-light-dark";
import { useRBAC } from "../rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, can } = useRBAC();

  const navCore = [
    {
      title: "Projects",
      url: "/projects",
      icon: FileStack,
      isActive: false,
      isDisabled: !can(PERMISSIONS["projects:read"]),
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Briefcase,
      isActive: false,
      isDisabled: !can(PERMISSIONS["clients:read"]),
    },
    {
      title: "Requests for Information",
      url: "/requests-for-information",
      icon: FileText,
      isActive: false,
      isDisabled: !can(PERMISSIONS["rfi:read"]),
    },
    {
      title: "Personnel",
      url: "/personnel",
      icon: Users,
      isActive: false,
      isDisabled: !can(PERMISSIONS["personnel:read"]),
    },
    {
      title: "Laboratories",
      url: "/labs",
      icon: FlaskConical,
      isActive: false,
      isDisabled: !can(PERMISSIONS["labs:read"]),
    },
    {
      title: "Equipment",
      url: "/equipment",
      icon: Cable,
      isActive: false,
      isDisabled: !can(PERMISSIONS["equipment:read"]),
    },
    ...(can(PERMISSIONS["security:read"])
      ? [
          {
            title: "Security",
            url: "/security",
            icon: ShieldCheck,
            isActive: false,
            isDisabled: false,
          },
        ]
      : []),
  ];

  const navCustomer = [
    {
      title: "Services",
      url: "/services",
      icon: LayoutList,
      items: [],
      isDisabled: !can(PERMISSIONS["services:read"]),
    },
  ];

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo icon={Rocket} name="GIMS by GETLAB" />
      </SidebarHeader>
      <SidebarContent aria-describedby={undefined}>
        <NavGroup label="Internal Modules" items={navCore} />
        <NavGroup label="Customer Modules" items={navCustomer} />
      </SidebarContent>
      <SidebarFooter>
        <ToggleLightDark />
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
