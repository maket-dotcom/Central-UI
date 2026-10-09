import React, { Suspense } from "react"
import Loader from "@/components/loader"

const ReleaseList = React.lazy(() => import("./release-list"))

const ReleaseListContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <ReleaseList />
    </Suspense>
  )
}

const ReleaseListConfig = {
  path: "/keyboard/releases/list",
  element: <ReleaseListContainer />,
}

export default ReleaseListConfig
