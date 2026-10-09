import React, { Suspense } from "react"
import Loader from "@/components/loader"

const AddFeature = React.lazy(() => import("./add-feature"))

const AddFeatureContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <AddFeature />
    </Suspense>
  )
}

const AddFeatureConfig = {
  path: "/keyboard/features/add",
  element: <AddFeatureContainer />,
}

export default AddFeatureConfig
