import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * Main dashboard layout shell.
 * Provides the sidebar context, site header, and main router Outlet for child pages.
 */
export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <SidebarProvider>
        {/* Dynamic application sidebar */}
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          {/* Top navigation header */}
          <SiteHeader />
          {/* Main scrollable page outlet */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
