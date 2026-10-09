import React, { Suspense } from "react"
import Loader from "@/components/loader"

const TesterList = React.lazy(() => import("./tester-list"))

const TesterListContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <TesterList />
    </Suspense>
  )
}

const TesterListConfig = {
  path: "/keyboard/testers",
  element: <TesterListContainer />,
}

export default TesterListConfig
