import { Navigate } from "react-router-dom"
import TesterListConfig from "./testerList/tester-list-config"

export const TesterConfig = {
  path: "testers",
  title: "Testers",
  children: [
    {
      index: true,
      element: <Navigate to="list" replace />,
    },
    TesterListConfig,
    {
      path: "*",
      element: <Navigate to="../list" replace />,
    },
  ],
}

export default TesterConfig
