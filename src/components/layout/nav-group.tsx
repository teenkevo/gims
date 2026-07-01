"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavGroup({
  items,
  label,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
    isDisabled?: boolean;
  }[];
  label: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if this item is active
          const isItemActive =
            item.isActive || pathname === item.url || pathname.startsWith(item.url + "/");

          return (
            <div key={item.title}>
              <SidebarMenuItem>
                {item.isDisabled ? (
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive}
                    disabled
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isItemActive}
                  >
                    <Link href={item.url} prefetch>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>

              {/* Render sub-items directly if they exist */}
              {item.items && item.items.length > 0 && (
                <SidebarMenuSub>
                  {item.items.map((subItem) => {
                    const isSubItemActive = pathname === subItem.url;

                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                          <Link href={subItem.url} prefetch>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              )}
            </div>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
