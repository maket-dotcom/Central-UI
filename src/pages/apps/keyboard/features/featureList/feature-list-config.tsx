import React, { Suspense } from "react"
import Loader from "@/components/loader"

const FeatureList = React.lazy(() => import("./feature-list"))

const FeatureListContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <FeatureList />
    </Suspense>
  )
}

const FeatureListConfig = {
  path: "/keyboard/features/list",
  element: <FeatureListContainer />,
}

export default FeatureListConfig
