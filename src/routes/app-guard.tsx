import { useEffect } from "react"
import { Navigate, useParams } from "react-router-dom"
import { useAppStore } from "@/store"
import { useGetApps } from "@/query/useAppInfo"
import { Loader2 } from "lucide-react"
import type { SelectedApp } from "@/store/slices/AppSlice"
import { applyAppTheme, resetAppTheme } from "@/utils/themeApplier"

interface AppGuardProps {
  children: React.ReactNode
}

/**
 * Route protection guard for dynamic app-scoped routes (/:appName/*).
 * Reads the application slug directly from URL route parameters.
 * Automatically resolves and hydrates the exact matching application from
 * Central-Backend into state and sessionStorage on direct deep-link or new tab.
 */
export default function AppGuard({ children }: AppGuardProps) {
  const { appName: routeAppName } = useParams<{ appName: string }>()
  const selectedApp = useAppStore((state) => state.selectedApp)
  const setSelectedApp = useAppStore((state) => state.setSelectedApp)
  const { data: appsData, isLoading } = useGetApps()

  // Extract application array safely from API response structure (handles nested data envelopes)
  const appsList: SelectedApp[] = Array.isArray(appsData?.data?.data)
    ? appsData.data.data
    : Array.isArray(appsData?.data)
      ? (appsData.data as unknown as SelectedApp[])
      : []

  // Strict exact match against registered backend applications (case-insensitive)
  const cleanRouteName = routeAppName?.toLowerCase() || ""
  const targetApp = appsList.find(
    (a: SelectedApp) => a.appName.toLowerCase() === cleanRouteName
  )

  // Synchronize the URL's app into Zustand and sessionStorage
  useEffect(() => {
    if (targetApp?.theme?.primary) {
      applyAppTheme(targetApp.theme)
    } else if (targetApp) {
      applyAppTheme({
        primary: "#059669",
      })
    } else {
      resetAppTheme()
    }
    return () => {
      resetAppTheme()
    }
  }, [targetApp?.theme?.primary])

  useEffect(() => {
    if (
      targetApp &&
      (!selectedApp ||
        selectedApp.appName.toLowerCase() !== targetApp.appName.toLowerCase())
    ) {
      setSelectedApp(targetApp)
    }
  }, [targetApp, selectedApp, setSelectedApp])

  // While apps are being queried or syncing into store, present loading state
  if (
    isLoading ||
    (targetApp &&
      (!selectedApp ||
        selectedApp.appName.toLowerCase() !== targetApp.appName.toLowerCase()))
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // If query completed and no matching app was found in Central database, redirect to catalog
  if (!isLoading && !targetApp) {
    return <Navigate to="/apps" replace />
  }

  return <>{children}</>
}
