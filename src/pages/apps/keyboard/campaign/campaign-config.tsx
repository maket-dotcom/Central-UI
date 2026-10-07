import { Navigate } from "react-router-dom"
import CampaignListConfig from "./campaignList/campaign-list-config"
import AddCampaignConfig from "./addCampaign/add-campaign-config"
import UpdateCampaignConfig from "./updateCampaign/update-campaign-config"

const CampaignConfig = {
  path: "/keyboard/campaign",
  title: "Campaign",
  children: [
    {
      index: true,
      element: <Navigate to="/keyboard/campaign/list" replace />,
    },
    CampaignListConfig,
    AddCampaignConfig,
    UpdateCampaignConfig,
    {
      path: "*",
      element: <Navigate to="/keyboard/campaign/list" replace />,
    },
  ],
}

export default CampaignConfig
