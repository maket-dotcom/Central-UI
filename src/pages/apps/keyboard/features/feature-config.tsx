import { Navigate } from "react-router-dom"
import FeatureListConfig from "./featureList/feature-list-config"
import AddFeatureConfig from "./addFeature/add-feature-config"
import UpdateFeatureConfig from "./updateFeature/update-feature-config"

export const FeatureConfig = {
  path: "features",
  title: "Feature Flags",
  children: [
    {
      index: true,
      element: <Navigate to="list" replace />,
    },
    FeatureListConfig,
    AddFeatureConfig,
    UpdateFeatureConfig,
    {
      path: "*",
      element: <Navigate to="../list" replace />,
    },
  ],
}

export default FeatureConfig
