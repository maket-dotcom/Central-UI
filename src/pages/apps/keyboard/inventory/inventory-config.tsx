import { Navigate } from "react-router-dom"
import InventoryListConfig from "./inventoryList/inventory-list-config"

export const InventoryConfig = {
  path: "inventory",
  title: "Client App Inventory",
  children: [
    {
      index: true,
      element: <Navigate to="summary" replace />,
    },
    InventoryListConfig,
    {
      path: "*",
      element: <Navigate to="../summary" replace />,
    },
  ],
}

export default InventoryConfig
