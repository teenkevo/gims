"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import Link from "next/link";
import {
  Archive,
  Briefcase,
  Cable,
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

import Image from "next/image";
import { ToggleLightDark } from "../layout/toggle-light-dark";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { UserNav } from "../user-nav";

const links = [
  {
    title: "Getting Started",
    label: "",
    icon: Cable,
    href: "#",
  },
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

export function Header() {
  const pathname = usePathname();
  return (
    <header className="fixed w-[100%] top-0 z-30 flex h-14 items-center gap-4 border-b border-dashed bg-background/30 backdrop-blur-md px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            {links.map((link, index) => (
              <SheetTrigger key={index} asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                    pathname === link.href &&
                      "flex items-center gap-4 px-2.5 text-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.title}
                </Link>
              </SheetTrigger>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <a href="/projects">
        <Image
          src="/logo.png"
          width="120"
          height="120"
          alt="GETLAB logo"
          className="md:flex px-4"
          priority={true}
        />
      </a>
      <div className="relative ml-auto flex-1 md:grow-0"></div>
      <ToggleLightDark />
      <UserNav />
    </header>
  );
}
