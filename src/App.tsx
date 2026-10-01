import { RouterProvider } from "react-router-dom"
import { router } from "@/routes/router"

/**
 * Root Application component providing the React Router instance.
 */
function App() {
  return <RouterProvider router={router} />
}

export default App
