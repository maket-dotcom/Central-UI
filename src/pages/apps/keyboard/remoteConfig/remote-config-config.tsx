import { Navigate } from "react-router-dom"
import RemoteConfigListConfig from "./configList/remote-config-list-config"
import {
  RemoteConfigCreateConfig,
  RemoteConfigEditConfig,
} from "./configEditor/remote-config-editor-config"

export const RemoteConfigConfig = {
  path: "/keyboard/remote-config",
  title: "Remote Config",
  children: [
    {
      index: true,
      element: <Navigate to="/keyboard/remote-config/list" replace />,
    },
    RemoteConfigListConfig,
    RemoteConfigCreateConfig,
    RemoteConfigEditConfig,
    {
      path: "*",
      element: <Navigate to="/keyboard/remote-config/list" replace />,
    },
  ],
}

export default RemoteConfigConfig
