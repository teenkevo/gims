"use client";
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
import Link from "next/link";
// import { LoginButton } from "@/components/auth/login-button";
// import { SignupButton } from "@/components/auth/signup-button";
// import { ModeToggle } from "@/components/modeToggle";

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
  return (
    <header className="fixed inset-x-0 max-w-4xl sm:mx-auto mx-4 top-0 z-50 flex h-14 items-center gap-2 border border-foreground/10 shadow-lg bg-background/30 backdrop-blur-md rounded-full px-4 sm:px-6 m-4">
      <Link href="/">
        <Image
          src="/logo.png"
          width="120"
          height="120"
          alt="GETLAB logo"
          className="md:flex px-4"
          priority={true}
        />
      </Link>
      <div className="relative ml-auto flex-1 md:grow-0"></div>
      {/* <ModeToggle />
      <LoginButton />
      <SignupButton /> */}
    </header>
  );
}
