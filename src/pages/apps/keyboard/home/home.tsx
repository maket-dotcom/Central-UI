import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Keyboard } from "lucide-react"

/**
 * Keyboard application home dashboard page.
 * Acts as the default landing view when the Keyboard app workspace is selected.
 */
export default function KeyboardHomePage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Keyboard Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome to the Central management portal for the Keyboard application.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Keyboard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Connected</div>
            <CardDescription className="mt-1">
              Active session connected to Keyboard backend services
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
