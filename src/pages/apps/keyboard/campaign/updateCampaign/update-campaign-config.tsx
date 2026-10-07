import React, { Suspense } from "react";
import Loader from "@/components/loader";

const UpdateCampaign = React.lazy(() => import("./update-campaign"));

const UpdateCampaignContainer: React.FC = () => {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-1 items-center justify-center min-h-[50vh]">
          <Loader size={32} />
        </div>
      }
    >
      <UpdateCampaign />
    </Suspense>
  );
};

const UpdateCampaignConfig = {
  path: "/keyboard/campaign/update/:id",
  element: <UpdateCampaignContainer />,
};

export default UpdateCampaignConfig;
