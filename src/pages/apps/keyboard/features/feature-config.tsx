import { Navigate } from "react-router-dom"
import FeatureListConfig from "./featureList/feature-list-config"
import AddFeatureConfig from "./addFeature/add-feature-config"
import UpdateFeatureConfig from "./updateFeature/update-feature-config"

export const FeatureConfig = {
  path: "/keyboard/features",
  title: "Feature Flags",
  children: [
    {
      index: true,
      element: <Navigate to="/keyboard/features/list" replace />,
    },
    FeatureListConfig,
    AddFeatureConfig,
    UpdateFeatureConfig,
    {
      path: "*",
      element: <Navigate to="/keyboard/features/list" replace />,
    },
  ],
}

export default FeatureConfig
