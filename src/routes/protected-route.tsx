import { Navigate } from "react-router-dom"
import { useAppStore } from "@/store"

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Route protection guard that requires an authenticated user token.
 * Hydrates token from localStorage and redirects unauthenticated users to /login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAppStore((state) => state.token)

  // If token is missing, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
