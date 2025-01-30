"use client";

import {
  Archive,
  ArrowLeftCircle,
  Briefcase,
  DatabaseZap,
  FileCheck2,
  FileStack,
  FlaskConical,
  LayoutList,
  ScrollText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { useState } from "react";
import { useSidebar } from "@/hooks/use-side-bar";
import { SideNav } from "./side-nav";

const links = [
  {
    title: "Projects",
    label: "8",
    icon: FileStack,
    href: "/projects",
  },
  {
    title: "Clients",
    label: "20",
    icon: Briefcase,
    href: "/clients",
  },
  {
    title: "Services",
    label: "20",
    icon: LayoutList,
    href: "/services",
  },
  {
    title: "Labs",
    label: "10",
    icon: FlaskConical,
    href: "/labs",
  },
  {
    title: "Staff",
    label: "",
    icon: Users,
    href: "#",
  },
  {
    title: "Data",
    label: "",
    icon: DatabaseZap,
    href: "#",
  },
  {
    title: "Workflows",
    label: "",
    icon: FileCheck2,
    href: "#",
  },
  {
    title: "Reporting",
    label: "23",
    icon: ScrollText,
    href: "#",
  },
  {
    title: "Billing",
    label: "",
    icon: Wallet,
    href: "#",
  },

  {
    title: "Equipment",
    label: "",
    icon: Archive,
    href: "#",
  },
  {
    title: "Security",
    label: "",
    icon: ShieldCheck,
    href: "#",
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isOpen, toggle } = useSidebar();
  const [status, setStatus] = useState(false);

  const handleToggle = () => {
    setStatus(true);
    toggle();
    setTimeout(() => setStatus(false), 500);
  };
  return (
    <nav
      className={cn(
        `relative hidden h-screen border-r border-dashed pt-11 md:block`,
        status && "duration-200",
        isOpen ? "w-44" : "w-[78px]",
        className
      )}
    >
      <ArrowLeftCircle
        className={cn(
          "absolute -right-3 bottom-20 z-50 cursor-pointer rounded-full border hover:text-primary text-3xl",
          !isOpen && "rotate-180"
        )}
        onClick={handleToggle}
      />
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="relative mt-3 space-y-1">
            <SideNav
              className="text-background opacity-0 transition-all duration-300 group-hover:z-50 group-hover:ml-4 group-hover:rounded group-hover:bg-foreground group-hover:p-2 group-hover:opacity-100"
              items={links}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
