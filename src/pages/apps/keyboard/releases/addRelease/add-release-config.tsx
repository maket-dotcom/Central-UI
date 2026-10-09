import React, { Suspense } from "react"
import Loader from "@/components/loader"

const AddRelease = React.lazy(() => import("./add-release"))

const AddReleaseContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <AddRelease />
    </Suspense>
  )
}

const AddReleaseConfig = {
  path: "/keyboard/releases/add",
  element: <AddReleaseContainer />,
}

export default AddReleaseConfig
