import type { ComponentType } from "react";

/**
 * Child navigation item within an expandable sidebar menu section.
 */
export interface SubMenuItem {
  /** Display label for the submenu link */
  title: string;
  /** Route path to navigate to when clicked */
  url: string;
}

/**
 * Top-level sidebar menu item with optional icon, active flag, and nested submenu links.
 */
export interface SidebarMenuItem {
  /** Display label for the menu item */
  title: string;
  /** Route path to navigate to when clicked */
  url: string;
  /** Optional React component icon rendering for the menu item */
  icon?: ComponentType<{ className?: string }>;
  /** Whether this menu item is currently active or expanded */
  isActive?: boolean;
  /** Optional nested submenu children */
  items?: SubMenuItem[];
}

/**
 * Full sidebar navigation configuration for a specific application.
 */
export interface AppSidebarConfig {
  /** Primary navigation menu items */
  navMain: SidebarMenuItem[];
  /** Optional secondary navigation menu items (e.g. settings, help) */
  navSecondary?: SidebarMenuItem[];
}

/**
 * Supported media categorization types used across media-upload and drop-box components.
 */
export type MediaType =
  | "profile"
  | "generic"
  | "assignment"
  | "step"
  | "assignment-banner"
  | "product"
  | (string & {});

