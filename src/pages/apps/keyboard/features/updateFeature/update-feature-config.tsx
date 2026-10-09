import React, { Suspense } from "react"
import Loader from "@/components/loader"

const UpdateFeature = React.lazy(() => import("./update-feature"))

const UpdateFeatureContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <UpdateFeature />
    </Suspense>
  )
}

const UpdateFeatureConfig = {
  path: "/keyboard/features/update/:key",
  element: <UpdateFeatureContainer />,
}

export default UpdateFeatureConfig
