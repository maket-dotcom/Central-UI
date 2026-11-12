import React, { Suspense } from "react"
import Loader from "@/components/loader"

const InventoryList = React.lazy(() => import("./inventory-list"))

const InventoryListContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <InventoryList />
    </Suspense>
  )
}

export const InventoryListConfig = {
  path: "summary",
  element: <InventoryListContainer />,
}

export default InventoryListConfig
