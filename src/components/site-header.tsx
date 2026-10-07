import { useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { useAppStore } from "@/store";
import { getSidebarConfig } from "@/configurations/sidebarRegistry";

/**
 * Top application header providing the sidebar toggle, dynamic breadcrumb title,
 * and light/dark theme switch.
 */
export function SiteHeader() {
  const { pathname } = useLocation();
  const selectedApp = useAppStore((state) => state.selectedApp);

  // Compute current page title from active route
  let currentPageTitle = "Dashboard";

  if (pathname === "/apps") {
    currentPageTitle = "Application Catalog";
  } else if (selectedApp?.appName) {
    const config = getSidebarConfig(selectedApp.appName);
    if (config) {
      for (const item of config.navMain) {
        // Match exact URL or nested paths (e.g., /keyboard/campaign/list matching /keyboard/campaign)
        if (item.url === pathname || (item.url && pathname.startsWith(item.url + "/"))) {
          currentPageTitle = item.title;
        }
        
        if (item.items) {
          const match = item.items.find((sub) => sub.url === pathname || (sub.url && pathname.startsWith(sub.url + "/")));
          if (match) {
            currentPageTitle = match.title;
          }
        }
      }
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur px-4">
      <div className="flex w-full items-center gap-2">
        {/* Toggle button to collapse/expand sidebar */}
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Dynamic page breadcrumb heading */}
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          {currentPageTitle}
        </h1>

        {/* Right action controls */}
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
