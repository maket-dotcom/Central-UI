import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Loader from "@/components/loader"
import { useGetApps } from "@/query/useAppInfo"
import { useAppStore } from "@/store"
import type { SelectedApp } from "@/store/slices/AppSlice"
import { appData } from "@/app/appData"

/**
 * Application selection catalog page.
 * Displays all registered applications from Central-Backend and allows
 * the user to select an active workspace to manage.
 */
export default function AppSelectionPage() {
  const navigate = useNavigate()
  const setSelectedApp = useAppStore((state) => state.setSelectedApp)
  const { data, isLoading, isError, error } = useGetApps()

  // Set selected application in store and localStorage, then route to app dashboard
  const handleSelectApp = (app: SelectedApp) => {
    setSelectedApp(app)
    navigate(`/${app.appName.toLowerCase()}/home`)
  }

  // Loading state while querying applications
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader size={32} />
      </div>
    )
  }

  // Error state if fetch failed
  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background p-4 text-center">
        <p className="font-semibold text-destructive">
          Failed to load apps: {error?.message || "Unknown error"}
        </p>
      </div>
    )
  }

  // Extract application array safely from API response structure (handles nested data envelopes)
  const apps: SelectedApp[] = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-6 md:p-12">
      {/* Page Title */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{appData.appName}</h1>
        <p className="mt-2 text-muted-foreground">Select an app to manage</p>
      </div>

      {/* Grid of Available Apps */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {apps.map((app) => (
          <Card
            key={app._id}
            id={`app-card-${app.appName.toLowerCase()}`}
            className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg"
            onClick={() => handleSelectApp(app)}
          >
            <CardHeader>
              <CardTitle className="capitalize">{app.appName}</CardTitle>
              <CardDescription className="truncate font-mono text-xs">
                {app.backendBaseUrl}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge
                variant={app.status === "active" ? "default" : "secondary"}
              >
                {app.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {apps.length === 0 && (
        <div className="mt-12 text-center text-muted-foreground">
          <p>No applications found in Central database.</p>
        </div>
      )}
    </div>
  )
}
