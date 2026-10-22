/**
 * Color lightening helper ported directly from adsshare-UI-Middlepage (Theme-variable.js).
 * Lightens a HEX color by blending each RGB channel toward 255 by the given percentage.
 */
export function lightenColor(hex: string, percent: number): string {
  if (!hex) return "#ffffff"
  let cleanHex = hex.trim()
  if (cleanHex.length === 4) {
    cleanHex = "#" + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2] + cleanHex[3] + cleanHex[3]
  }

  const r = parseInt(cleanHex.slice(1, 3), 16) || 0
  const g = parseInt(cleanHex.slice(3, 5), 16) || 0
  const b = parseInt(cleanHex.slice(5, 7), 16) || 0

  const lighten = (channel: number) =>
    Math.min(255, Math.floor(channel + (255 - channel) * (percent / 100)))

  const toHex = (channel: number) => channel.toString(16).padStart(2, "0")
  return `#${toHex(lighten(r))}${toHex(lighten(g))}${toHex(lighten(b))}`
}

/**
 * Color darkening helper (matching darken from MUI/adsshare-UI-Middlepage).
 * Darkens a HEX color by multiplying each RGB channel by (1 - percent / 100).
 */
export function darkenColor(hex: string, percent: number): string {
  if (!hex) return "#000000"
  let cleanHex = hex.trim()
  if (cleanHex.length === 4) {
    cleanHex = "#" + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2] + cleanHex[3] + cleanHex[3]
  }

  const r = parseInt(cleanHex.slice(1, 3), 16) || 0
  const g = parseInt(cleanHex.slice(3, 5), 16) || 0
  const b = parseInt(cleanHex.slice(5, 7), 16) || 0

  const darken = (channel: number) =>
    Math.max(0, Math.floor(channel * (1 - percent / 100)))

  const toHex = (channel: number) => channel.toString(16).padStart(2, "0")
  return `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`
}

/**
 * Calculate accessible text color (black or white) based on background HEX luminance.
 */
export function getContrastTextColor(hex?: string): string {
  if (!hex) return "#ffffff"
  const cleanHex = hex.replace("#", "").trim()
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex

  if (fullHex.length !== 6) return "#ffffff"

  const r = parseInt(fullHex.substring(0, 2), 16) || 0
  const g = parseInt(fullHex.substring(2, 4), 16) || 0
  const b = parseInt(fullHex.substring(4, 6), 16) || 0

  // Perceived brightness formula (YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 140 ? "#09090b" : "#ffffff"
}

export function hexToHsl(hex: string): [number, number, number] {
  let c = hex.replace("#", "").trim()
  if (c.length === 3) {
    c = c
      .split("")
      .map((x) => x + x)
      .join("")
  }
  const r = (parseInt(c.substring(0, 2), 16) || 0) / 255
  const g = (parseInt(c.substring(2, 4), 16) || 0) / 255
  const b = (parseInt(c.substring(4, 6), 16) || 0) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export function hslToHex(h: number, s: number, l: number): string {
  const normL = l / 100
  const normS = s / 100
  const a = normS * Math.min(normL, 1 - normL)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = normL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export interface AppThemeConfig {
  primary?: string
}

export interface SidebarPalette {
  sidebarBg: string
  sidebarBorder: string
  sidebarAccent: string
  sidebarAccentFg: string
  sidebarFg: string
  secondaryBg: string
  secondaryFg: string
}

export interface ThemePalettes {
  light: SidebarPalette
  dark: SidebarPalette
}

/**
 * Derive palettes using 100% same design system as adsshare-UI-Middlepage:
 * - Sidebar background: Exact user themeColor.
 * - Active tab: Pure white pill (#ffffff) with brand-colored text & icon (matches adsshare listItemSelectedStyle).
 * - Unselected tabs: Crisp white text (#ffffff) on brand sidebar.
 * - Secondary badge: 90% lighten tint (matches adsshare lightenColor(themeColor, 90)).
 * - Hover state: 30% lighten tint (matches adsshare lightenColor(themeColor, 30)).
 */
export function deriveThemePalettes(primaryHex: string): ThemePalettes {
  const [h, s] = hexToHsl(primaryHex)

  return {
    light: {
      sidebarBg: primaryHex,                       // Same as adsshare theme.palette.background.sidebar
      sidebarBorder: darkenColor(primaryHex, 12),  // Subtle crisp border
      sidebarAccent: "#ffffff",                     // Same as adsshare listItemSelectedStyle background: #FFFFFF
      sidebarAccentFg: primaryHex,                 // Same as adsshare listItemSelectedStyle text/icon: themeColor
      sidebarFg: "#ffffff",                        // Unselected text: White
      secondaryBg: lightenColor(primaryHex, 90),   // Same as adsshare lightenColor(themeColor, 90)
      secondaryFg: primaryHex,                     // Same as adsshare badge text: themeColor
    },
    dark: {
      sidebarBg: hslToHex(h, Math.min(s, 45), 26),
      sidebarBorder: hslToHex(h, Math.min(s, 40), 33),
      sidebarAccent: hslToHex(h, Math.min(s, 55), 34),
      sidebarAccentFg: "#ffffff",
      sidebarFg: "#f8fafc",
      secondaryBg: hslToHex(h, Math.min(s, 35), 22),
      secondaryFg: hslToHex(h, Math.min(s, 60), 75),
    },
  }
}

const DYNAMIC_STYLE_ID = "central-app-dynamic-theme"

/**
 * Apply application brand color dynamically matching adsshare-UI-Middlepage logic:
 */
export function applyAppTheme(theme?: AppThemeConfig | null) {
  if (typeof document === "undefined") return

  if (theme?.primary) {
    const primary = theme.primary.trim()
    const primaryFg = getContrastTextColor(primary)
    const palettes = deriveThemePalettes(primary)

    const css = `
:root {
  --primary: ${primary};
  --primary-foreground: ${primaryFg};
  --ring: ${primary};
  --sidebar: ${palettes.light.sidebarBg};
  --sidebar-foreground: ${palettes.light.sidebarFg};
  --sidebar-border: ${palettes.light.sidebarBorder};
  --sidebar-primary: ${primary};
  --sidebar-primary-foreground: ${primaryFg};
  --sidebar-accent: ${palettes.light.sidebarAccent};
  --sidebar-accent-foreground: ${palettes.light.sidebarAccentFg};
  --sidebar-ring: ${primary};
  --secondary: ${palettes.light.secondaryBg};
  --secondary-foreground: ${palettes.light.secondaryFg};
  --accent: ${lightenColor(primary, 30)};
  --accent-foreground: #ffffff;
}

[data-sidebar="sidebar"] {
  --muted-foreground: color-mix(in srgb, var(--sidebar-foreground) 75%, transparent);
  --primary: var(--sidebar-accent);
  --primary-foreground: var(--sidebar-accent-foreground);
}

[data-sidebar="sidebar"] [data-sidebar="menu-button"]:hover,
[data-sidebar="sidebar"] [data-sidebar="menu-button"][data-state="open"],
[data-sidebar="sidebar"] [data-sidebar="menu-button"][data-active="true"] {
  --muted-foreground: color-mix(in srgb, var(--sidebar-accent-foreground) 75%, transparent);
}

.dark {
  --primary: ${primary};
  --primary-foreground: ${primaryFg};
  --ring: ${primary};
  --sidebar: ${palettes.dark.sidebarBg};
  --sidebar-foreground: ${palettes.dark.sidebarFg};
  --sidebar-border: ${palettes.dark.sidebarBorder};
  --sidebar-primary: ${primary};
  --sidebar-primary-foreground: ${primaryFg};
  --sidebar-accent: ${palettes.dark.sidebarAccent};
  --sidebar-accent-foreground: ${palettes.dark.sidebarAccentFg};
  --sidebar-ring: ${primary};
  --secondary: ${palettes.dark.secondaryBg};
  --secondary-foreground: ${palettes.dark.secondaryFg};
  --accent: ${palettes.dark.sidebarAccent};
  --accent-foreground: ${palettes.dark.sidebarAccentFg};
}

.dark [data-sidebar="sidebar"] {
  --muted-foreground: color-mix(in srgb, var(--sidebar-foreground) 75%, transparent);
  --primary: var(--sidebar-accent);
  --primary-foreground: var(--sidebar-accent-foreground);
}

.dark [data-sidebar="sidebar"] [data-sidebar="menu-button"]:hover,
.dark [data-sidebar="sidebar"] [data-sidebar="menu-button"][data-state="open"],
.dark [data-sidebar="sidebar"] [data-sidebar="menu-button"][data-active="true"] {
  --muted-foreground: color-mix(in srgb, var(--sidebar-accent-foreground) 75%, transparent);
}
`

    let styleEl = document.getElementById(DYNAMIC_STYLE_ID) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = DYNAMIC_STYLE_ID
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = css

    // Clear legacy inline properties on root to ensure style tag takes effect
    clearRootInlineProperties()
  } else {
    resetAppTheme()
  }
}

function clearRootInlineProperties() {
  if (typeof document === "undefined") return
  const root = document.documentElement
  const props = [
    "--primary",
    "--primary-foreground",
    "--ring",
    "--sidebar",
    "--sidebar-foreground",
    "--sidebar-border",
    "--sidebar-primary",
    "--sidebar-primary-foreground",
    "--sidebar-accent",
    "--sidebar-accent-foreground",
    "--sidebar-ring",
    "--secondary",
    "--secondary-foreground",
    "--accent",
    "--accent-foreground",
  ]
  props.forEach((prop) => root.style.removeProperty(prop))
}

/**
 * Remove custom app theme CSS variables and restore default Central UI theme.
 */
export function resetAppTheme() {
  if (typeof document === "undefined") return

  const styleEl = document.getElementById(DYNAMIC_STYLE_ID)
  if (styleEl) {
    styleEl.remove()
  }
  clearRootInlineProperties()
}
