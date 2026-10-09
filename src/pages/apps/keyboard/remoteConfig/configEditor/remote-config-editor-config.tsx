import React, { Suspense } from "react"
import Loader from "@/components/loader"

const RemoteConfigEditor = React.lazy(() => import("./remote-config-editor"))

const CreateConfigContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <RemoteConfigEditor isCreate />
    </Suspense>
  )
}

const EditConfigContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <RemoteConfigEditor />
    </Suspense>
  )
}

export const RemoteConfigCreateConfig = {
  path: "/keyboard/remote-config/create",
  element: <CreateConfigContainer />,
}

export const RemoteConfigEditConfig = {
  path: "/keyboard/remote-config/edit/:namespace/:platform",
  element: <EditConfigContainer />,
}
