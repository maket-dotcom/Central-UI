import { Navigate } from "react-router-dom"
import ReleaseListConfig from "./releaseList/release-list-config"
import AddReleaseConfig from "./addRelease/add-release-config"
import UpdateReleaseConfig from "./updateRelease/update-release-config"

export const ReleaseConfig = {
  path: "releases",
  title: "Releases",
  children: [
    {
      index: true,
      element: <Navigate to="list" replace />,
    },
    ReleaseListConfig,
    AddReleaseConfig,
    UpdateReleaseConfig,
    {
      path: "*",
      element: <Navigate to="../list" replace />,
    },
  ],
}

export default ReleaseConfig
