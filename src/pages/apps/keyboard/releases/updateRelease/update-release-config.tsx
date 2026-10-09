import React, { Suspense } from "react"
import Loader from "@/components/loader"

const UpdateRelease = React.lazy(() => import("./update-release"))

const UpdateReleaseContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <UpdateRelease />
    </Suspense>
  )
}

const UpdateReleaseConfig = {
  path: "/keyboard/releases/update/:id",
  element: <UpdateReleaseContainer />,
}

export default UpdateReleaseConfig
