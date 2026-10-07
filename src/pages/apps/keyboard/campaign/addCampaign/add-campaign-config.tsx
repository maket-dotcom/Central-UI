import React, { Suspense } from "react"
import Loader from "@/components/loader"

const AddCampaign = React.lazy(() => import("./add-campaign"))

const AddCampaignContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <AddCampaign />
    </Suspense>
  )
}

const AddCampaignConfig = {
  path: "/keyboard/campaign/add",
  element: <AddCampaignContainer />,
}

export default AddCampaignConfig
