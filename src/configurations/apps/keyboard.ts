import { IconHome } from "@tabler/icons-react";
import type { AppSidebarConfig } from "../types";

/**
 * Sidebar navigation configuration for the Keyboard application.
 * Defines main navigation links displayed when the Keyboard workspace is active.
 */
export const keyboardSidebarConfig: AppSidebarConfig = {
  navMain: [
    {
      title: "Home",
      url: "/keyboard/home",
      icon: IconHome,
    },
    // Future keyboard features to be added here:
    // { title: "Themes", url: "/keyboard/themes", icon: IconPalette },
    // { title: "Settings", url: "/keyboard/settings", icon: IconSettings },
  ],
};
