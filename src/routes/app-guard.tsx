import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAppStore } from "@/store"
import { useGetApps } from "@/query/useAppInfo"
import { Loader2 } from "lucide-react"
import type { SelectedApp } from "@/store/slices/AppSlice"

interface AppGuardProps {
  children: React.ReactNode
  expectedAppName: string
}

/**
 * Route protection guard for app-scoped routes.
 * Ensures an application is actively selected and verifies that the selected
 * application in state matches the expected application for this route.
 * Hydrates from the backend API if accessed directly in a new tab.
 */
export default function AppGuard({ children, expectedAppName }: AppGuardProps) {
  const selectedApp = useAppStore((state) => state.selectedApp)
  const setSelectedApp = useAppStore((state) => state.setSelectedApp)
  const { data: appsData, isLoading } = useGetApps()

  // Extract application array safely from API response structure
  const appsList: SelectedApp[] = Array.isArray(appsData?.data?.data)
    ? appsData.data.data
    : Array.isArray(appsData?.data)
      ? appsData.data
      : Array.isArray(appsData)
        ? appsData
        : []

  // If we have API data, try to find the expected app
  const foundApp = appsList.find(
    (a: SelectedApp) =>
      a.appName.toLowerCase() === expectedAppName.toLowerCase()
  )

  // Attempt to hydrate the active app from API data if it's missing from memory
  useEffect(() => {
    if (!selectedApp && foundApp) {
      setSelectedApp(foundApp)
    }
  }, [selectedApp, foundApp, setSelectedApp])

  // While apps are being fetched to rehydrate, OR if we found the app but haven't synced to Zustand yet, show a loading state
  if (!selectedApp && (isLoading || foundApp)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // If no app is selected after loading AND it wasn't found in the API response, redirect to app catalog
  if (!selectedApp) {
    return <Navigate to="/apps" replace />
  }

  // If the currently selected app doesn't match the route's expected app, redirect to actual selected app root
  if (expectedAppName.toLowerCase() !== selectedApp.appName.toLowerCase()) {
    return (
      <Navigate to={`/${selectedApp.appName.toLowerCase()}/home`} replace />
    )
  }

  return <>{children}</>
}
