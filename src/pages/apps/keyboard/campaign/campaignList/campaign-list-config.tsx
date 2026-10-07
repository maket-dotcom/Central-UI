import React, { Suspense } from "react";
import Loader from "@/components/loader";

const CampaignList = React.lazy(() => import("./campaign-list"));

const CampaignListContainer: React.FC = () => {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-1 items-center justify-center min-h-[50vh]">
          <Loader size={32} />
        </div>
      }
    >
      <CampaignList />
    </Suspense>
  );
};

const CampaignListConfig = {
  path: "/keyboard/campaign/list",
  element: <CampaignListContainer />,
};

export default CampaignListConfig;
