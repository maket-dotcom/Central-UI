import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import type { SidebarMenuItem as SidebarMenuItemType } from "@/configurations/types";
import { cn } from "@/lib/utils";

interface NavMainProps {
  /** Array of top-level navigation items defined in app sidebar config */
  items: SidebarMenuItemType[];
}

/**
 * Primary navigation menu renderer. Supports standalone route links as well as
 * collapsible submenu groups with active route auto-expansion.
 */
export function NavMain({ items = [] }: NavMainProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Track single open accordion section
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  // Auto-expand parent group if a child route is active
  useEffect(() => {
    for (const item of items) {
      if (item.items && item.items.length > 0) {
        const isChildActive = item.items.some((sub) =>
          currentPath.startsWith(sub.url)
        );
        if (isChildActive) {
          setOpenTitle(item.title);
          break;
        }
      }
    }
  }, [currentPath, items]);

  const toggleAccordion = (title: string) => {
    setOpenTitle((prev) => (prev === title ? null : title));
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu>
          {items.map((item) => {
            const hasSubItems = Boolean(item.items && item.items.length > 0);
            const isOpen = openTitle === item.title;

            // Render collapsible submenu section
            if (hasSubItems && item.items) {
              const isGroupActive = item.items.some((sub) =>
                currentPath.startsWith(sub.url)
              );

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => toggleAccordion(item.title)}
                    isActive={isGroupActive}
                    tooltip={item.title}
                    className="w-full flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="size-4 shrink-0" />}
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="size-4 shrink-0 transition-transform text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 transition-transform text-muted-foreground" />
                    )}
                  </SidebarMenuButton>

                  {isOpen && (
                    <SidebarMenuSub className="ml-4 border-l border-border pl-2 my-1 flex flex-col gap-1">
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={`${item.title}-${subItem.title}-${subItem.url}`}>
                          <NavLink to={subItem.url} className="w-full">
                            {({ isActive }) => (
                              <SidebarMenuSubButton
                                isActive={isActive}
                                className={cn(
                                  "w-full flex items-center gap-2 py-1 px-2 rounded-md transition-colors",
                                  isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"
                                )}
                              >
                                <span className="text-xs">{subItem.title}</span>
                              </SidebarMenuSubButton>
                            )}
                          </NavLink>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            }

            // Render single standalone navigation item
            return (
              <SidebarMenuItem key={item.title}>
                <NavLink to={item.url || "#"} className="w-full">
                  {({ isActive }) => (
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      className="cursor-pointer"
                    >
                      {item.icon && <item.icon className="size-4 shrink-0" />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
