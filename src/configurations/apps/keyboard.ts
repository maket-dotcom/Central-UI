import {
  IconBrandCampaignmonitor,
  IconHome,
  IconToggleLeft,
  IconAdjustments,
  IconRocket,
  IconDeviceMobileCheck,
} from "@tabler/icons-react"
import type { AppSidebarConfig } from "../types"

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
    {
      title: "Campaign",
      url: "/keyboard/campaign",
      icon: IconBrandCampaignmonitor,
    },
    {
      title: "Feature Flags",
      url: "/keyboard/features",
      icon: IconToggleLeft,
    },
    {
      title: "Remote Config",
      url: "/keyboard/remote-config",
      icon: IconAdjustments,
    },
    {
      title: "Releases",
      url: "/keyboard/releases",
      icon: IconRocket,
    },
    {
      title: "Testers",
      url: "/keyboard/testers",
      icon: IconDeviceMobileCheck,
    },
  ],
}
