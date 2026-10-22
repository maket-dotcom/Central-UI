import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Loader from "@/components/loader"
import { ModeToggle } from "@/components/mode-toggle"
import { useGetApps } from "@/query/useAppInfo"
import { useAppStore } from "@/store"
import type { SelectedApp } from "@/store/slices/AppSlice"
import { appData } from "@/app/appData"
import { resetAppTheme } from "@/utils/themeApplier"
import { Settings, Plus, LogOut, Globe } from "lucide-react"

/**
 * Application selection catalog page.
 * Displays all registered applications from Central-Backend and allows
 * the user to select an active workspace to manage.
 */
export default function AppSelectionPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setSelectedApp = useAppStore((state) => state.setSelectedApp)
  const clearAuth = useAppStore((state) => state.clearAuth)
  const clearApp = useAppStore((state) => state.clearApp)

  // Clear app workspace queries whenever returning to app catalog, keeping apps list cached
  useEffect(() => {
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== "apps",
    })
    resetAppTheme()
  }, [queryClient])

  const { data, isLoading, isError, error } = useGetApps()

  // Set selected application in store and sessionStorage, then route to app dashboard
  const handleSelectApp = (app: SelectedApp) => {
    setSelectedApp(app)
    navigate(`/${app.appName.toLowerCase()}/home`)
  }

  const handleLogout = () => {
    clearAuth()
    clearApp()
    navigate("/login")
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
      ? (data.data as unknown as SelectedApp[])
      : []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Utility Bar */}
      <header className="flex h-14 items-center justify-between border-b px-6">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {appData.appName}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/apps/manage")}
            className="cursor-pointer"
          >
            <Settings className="mr-1.5 size-3.5" />
            Manage Apps
          </Button>
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col items-center p-6 md:p-12">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {appData.appName}
          </h1>
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
              <CardHeader className="flex flex-row items-center gap-3.5 space-y-0">
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                  {app.logo?.link ? (
                    <img
                      src={app.logo.link}
                      alt={app.appName}
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <Globe className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <CardTitle className="truncate text-base">{app.appName}</CardTitle>
                  <CardDescription className="truncate font-mono text-xs">
                    {app.backendBaseUrl}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge
                  variant={app.status === "active" ? "default" : "secondary"}
                >
                  {app.status}
                </Badge>
                {app.theme?.primary && (
                  <div className="flex items-center gap-1" title="App Theme Colors">
                    <span
                      className="size-3 rounded-full border border-background shadow-xs"
                      style={{ backgroundColor: app.theme.primary }}
                    />
                    {app.theme.secondary && (
                      <span
                        className="size-2.5 rounded-full border border-background shadow-xs"
                        style={{ backgroundColor: app.theme.secondary }}
                      />
                    )}
                    {app.theme.tertiary && (
                      <span
                        className="size-2 rounded-full border border-background shadow-xs"
                        style={{ backgroundColor: app.theme.tertiary }}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {apps.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center text-muted-foreground">
            <p>No applications found in Central database.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/apps/manage")}
            >
              <Plus className="mr-1.5 size-3.5" />
              Register New App
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
