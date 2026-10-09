import { useState } from "react"
import { format } from "date-fns"
import {
  RotateCcw,
  User,
  Clock,
  ChevronDown,
  ChevronRight,
  History,
  Layers,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Loader from "@/components/loader"
import {
  useGetConfigHistory,
  useRollbackConfig,
} from "@/query/keyboard/useRemoteConfig"
import type { ConfigHistoryDoc } from "@/utils/schemas/keyboard/remoteConfigSchema"

interface RemoteConfigHistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  namespace: string
  platform: string
  currentVersion?: number
}

export const RemoteConfigHistoryDrawer: React.FC<
  RemoteConfigHistoryDrawerProps
> = ({ open, onOpenChange, namespace, platform, currentVersion }) => {
  const [expandedVersions, setExpandedVersions] = useState<
    Record<number, boolean>
  >({})

  const { data: historyResp, isLoading } = useGetConfigHistory({
    namespace,
    platform,
    limit: 50,
  })

  const rollbackMutation = useRollbackConfig()

  const historyItems: ConfigHistoryDoc[] = Array.isArray(historyResp?.data)
    ? historyResp.data
    : []

  const toggleExpand = (version: number) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [version]: !prev[version],
    }))
  }

  const handleRollback = (version: number) => {
    if (
      window.confirm(
        `Are you sure you want to roll back ${namespace} (${platform}) to version ${version}? This will create a new release version with those values.`
      )
    ) {
      rollbackMutation.mutate(
        {
          namespace,
          platform,
          body: { version },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <SheetTitle>Version History</SheetTitle>
          </div>
          <SheetDescription>
            Audit snapshots for{" "}
            <span className="font-mono font-medium text-foreground">
              {namespace}
            </span>{" "}
            ({platform}). Current version:{" "}
            <strong>v{currentVersion || 1}</strong>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader />
            </div>
          ) : historyItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <History className="mx-auto mb-2 size-8 opacity-40" />
              <p className="text-sm font-medium">
                No version snapshots recorded yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Snapshots are automatically created when configurations are
                modified.
              </p>
            </div>
          ) : (
            <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-border">
              {historyItems.map((item) => {
                const isCurrent = item.version === currentVersion
                const isExpanded = !!expandedVersions[item.version]

                return (
                  <div
                    key={item._id || item.version}
                    className="group relative"
                  >
                    {/* Timeline bullet dot */}
                    <div
                      className={`absolute top-1.5 -left-6 size-2.5 rounded-full ring-4 ring-background ${
                        isCurrent ? "bg-primary" : "bg-muted-foreground/60"
                      }`}
                    />

                    {/* Snapshot Card */}
                    <div className="space-y-2.5 rounded-lg border bg-card p-3 shadow-xs transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isCurrent ? "default" : "secondary"}
                            className="px-1.5 py-0 font-mono text-xs"
                          >
                            v{item.version}
                          </Badge>
                          {isCurrent && (
                            <span className="text-[11px] font-medium text-primary">
                              Active
                            </span>
                          )}
                        </div>

                        {!isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollback(item.version)}
                            disabled={rollbackMutation.isPending}
                            className="h-6 cursor-pointer gap-1 text-xs hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <RotateCcw className="size-3" />
                            Rollback
                          </Button>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3" />
                          <span>
                            {item.createdAt
                              ? format(
                                  new Date(item.createdAt),
                                  "MMM d, yyyy HH:mm:ss"
                                )
                              : "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="size-3" />
                          <span>by {item.updatedBy || "admin"}</span>
                        </div>
                        {(item.minBuildNumber || item.maxBuildNumber) && (
                          <div className="flex items-center gap-1.5 text-muted-foreground/80">
                            <Layers className="size-3" />
                            <span>
                              Builds: {item.minBuildNumber || 1} –{" "}
                              {item.maxBuildNumber || "latest"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Toggle & Expandable JSON preview */}
                      <div className="border-t pt-1">
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.version)}
                          className="flex w-full cursor-pointer items-center justify-between py-0.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <span className="font-mono">
                            {Object.keys(item.values || {}).length} keys
                            configured
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronRight className="size-3.5" />
                          )}
                        </button>

                        {isExpanded && (
                          <pre className="mt-2 max-h-48 overflow-y-auto rounded border bg-muted/60 p-2 font-mono text-[11px] leading-4 break-all whitespace-pre-wrap text-foreground/90">
                            {JSON.stringify(item.values || {}, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default RemoteConfigHistoryDrawer
