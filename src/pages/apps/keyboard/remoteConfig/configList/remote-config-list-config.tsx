import React, { Suspense } from "react"
import Loader from "@/components/loader"

const RemoteConfigList = React.lazy(() => import("./remote-config-list"))

const RemoteConfigListContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <RemoteConfigList />
    </Suspense>
  )
}

const RemoteConfigListConfig = {
  path: "/keyboard/remote-config/list",
  element: <RemoteConfigListContainer />,
}

export default RemoteConfigListConfig
