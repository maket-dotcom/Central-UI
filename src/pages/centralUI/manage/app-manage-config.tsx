import React, { Suspense } from "react"
import Loader from "@/components/loader"

const AppManage = React.lazy(() => import("./app-manage"))

const AppManageContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <AppManage />
    </Suspense>
  )
}

/**
 * Route configuration for Application Management.
 * Child route under /apps (resolves to /apps/manage).
 */
export const appManageConfig = {
  path: "manage",
  title: "Application Management",
  element: <AppManageContainer />,
}

export default appManageConfig
