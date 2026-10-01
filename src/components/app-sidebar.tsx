import * as React from "react";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/store";
import { getSidebarConfig } from "@/configurations/sidebarRegistry";
import { appData } from "@/app/appData";

/**
 * Dynamic application sidebar.
 * Reads the currently selected app from the Zustand store and resolves
 * its specific navigation structure from the sidebarRegistry.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Read active app and auth state from store
  const selectedApp = useAppStore((state) => state.selectedApp);

  // Dynamically resolve sidebar configuration based on the selected application
  const sidebarConfig = selectedApp?.appName
    ? getSidebarConfig(selectedApp.appName)
    : null;

  // Primary navigation items (empty array fallback if unconfigured)
  const navMainItems = sidebarConfig?.navMain || [];
  const navSecondaryItems = sidebarConfig?.navSecondary || [];

  // Default admin profile details confirmed in design alignment
  const currentUser = {
    name: "Admin",
    email: "admin@central.internal",
    avatar: "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link to="/apps" className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <LayoutGrid className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-sm">
                      {appData.appName}
                    </span>
                    {selectedApp?.appName && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {selectedApp.appName}
                      </span>
                    )}
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main app-specific menu */}
        <NavMain items={navMainItems} />
        {/* Optional secondary menu items pinned to bottom */}
        {navSecondaryItems.length > 0 && (
          <NavSecondary items={navSecondaryItems} className="mt-auto" />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
