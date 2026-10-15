import { Navigate } from "react-router-dom"
import RemoteConfigListConfig from "./configList/remote-config-list-config"
import {
  RemoteConfigCreateConfig,
  RemoteConfigEditConfig,
} from "./configEditor/remote-config-editor-config"

export const RemoteConfigConfig = {
  path: "remote-config",
  title: "Remote Config",
  children: [
    {
      index: true,
      element: <Navigate to="list" replace />,
    },
    RemoteConfigListConfig,
    RemoteConfigCreateConfig,
    RemoteConfigEditConfig,
    {
      path: "*",
      element: <Navigate to="../list" replace />,
    },
  ],
}

export default RemoteConfigConfig
