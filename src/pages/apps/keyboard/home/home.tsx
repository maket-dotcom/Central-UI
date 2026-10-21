import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Keyboard } from "lucide-react"
import { useAppStore } from "@/store"

/**
 * Keyboard application home dashboard page.
 * Acts as the default landing view when the Keyboard app workspace is selected.
 */
export default function KeyboardHomePage() {
  const selectedApp = useAppStore((state) => state.selectedApp)
  const appDisplayName = selectedApp?.appName
    ? selectedApp.appName.charAt(0).toUpperCase() + selectedApp.appName.slice(1)
    : "Keyboard"

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/40 shadow-xs">
          {selectedApp?.logo?.link ? (
            <img
              src={selectedApp.logo.link}
              alt={selectedApp.appName}
              className="size-full object-cover"
            />
          ) : (
            <Keyboard className="size-7 text-primary" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {appDisplayName} Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome to the Central management portal for the {appDisplayName} application.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {selectedApp?.logo?.link ? (
              <img
                src={selectedApp.logo.link}
                alt={selectedApp.appName}
                className="size-5 rounded-sm object-cover"
              />
            ) : (
              <Keyboard className="size-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Connected</div>
            <CardDescription className="mt-1">
              Active session connected to {appDisplayName} backend services
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
