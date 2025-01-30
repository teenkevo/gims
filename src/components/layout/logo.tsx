import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { type LucideIcon } from "lucide-react";
import Image from "next/image";

interface LogoProps {
  icon: LucideIcon;
  name: string;
}

export function Logo({ icon: Icon }: LogoProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon className="size-4" />
          </div>
          <Image
            src="/logo.png"
            width="120"
            height="120"
            alt="GETLAB logo"
            className="md:flex px-4"
            priority={true}
          />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
