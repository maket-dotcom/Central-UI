import AppSelectionPage from "./app-selection"

/**
 * Route configuration for the App Selection Catalog.
 * Serves as the index child route under /apps.
 */
export const appSelectionConfig = {
  index: true,
  title: "Select App",
  element: <AppSelectionPage />,
}

export default appSelectionConfig
