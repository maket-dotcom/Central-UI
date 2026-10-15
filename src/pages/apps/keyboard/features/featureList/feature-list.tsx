import React, { useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Plus,
  RefreshCw,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Flag,
  FileCode2,
  MoreVerticalIcon,
  Zap,
  ShieldAlert,
  Play,
  Sliders,
} from "lucide-react"
import { IconBrandAndroid, IconBrandApple } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import SelectComponent from "@/components/inputComponents/select-component"
import { useGetFeatures, useUpdateFeature } from "@/query/keyboard/useFeature"
import { useTableSort } from "@/hooks/useTableSort"
import DeleteFeatureDialog from "../delete-feature"
import Loader from "@/components/loader"
import type { FeatureFlag } from "@/utils/schemas/keyboard/featureSchema"
import { format } from "date-fns"
import { HelpButton } from "@/components/helpTour"
import { FeatureHelpDrawer } from "../components/feature-help-drawer"
import { FeatureStatsOverview } from "../components/feature-stats-overview"
import { FeatureQuickRampDialog } from "../components/feature-quick-ramp-dialog"
import { FeatureSimulatorCard } from "../components/feature-simulator-card"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export const FeatureList: React.FC = () => {
  const navigate = useNavigate()
  const { appName } = useParams<{ appName: string }>()
  const appSlug = appName?.toLowerCase() || "keyboard"
  const {
    data: featuresResp,
    isLoading,
    isFetching,
    refetch,
  } = useGetFeatures()
  const updateMutation = useUpdateFeature()

  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [metricFilter, setMetricFilter] = useState<string>("all")

  // Dialogs
  const [deleteTarget, setDeleteTarget] = useState<FeatureFlag | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [rampTarget, setRampTarget] = useState<FeatureFlag | null>(null)
  const [rampOpen, setRampOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [simulateTarget, setSimulateTarget] = useState<FeatureFlag | null>(null)
  const [simulateOpen, setSimulateOpen] = useState(false)

  const features: FeatureFlag[] = useMemo(() => {
    return Array.isArray(featuresResp?.data) ? featuresResp.data : []
  }, [featuresResp])

  // Filter features
  const filteredFeatures = useMemo(() => {
    let result = features

    // Metric card filter
    if (metricFilter === "canary") {
      result = result.filter(
        (f) => f.enabled && f.rolloutPercentage > 0 && f.rolloutPercentage < 100
      )
    } else if (metricFilter === "vip") {
      result = result.filter((f) => f.allowDevices && f.allowDevices.length > 0)
    } else if (metricFilter === "deny") {
      result = result.filter((f) => f.denyDevices && f.denyDevices.length > 0)
    }

    // Platform filter
    if (platformFilter !== "all") {
      result = result.filter(
        (f) =>
          f.platforms &&
          f.platforms.includes(platformFilter as "android" | "ios")
      )
    }

    // State filter
    if (stateFilter !== "all") {
      result = result.filter((f) =>
        stateFilter === "active" ? f.enabled : !f.enabled
      )
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (f) =>
          f.key.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      )
    }

    return result
  }, [features, platformFilter, stateFilter, metricFilter, searchQuery])

  // Sorting
  const { sortedItems, sortConfig, requestSort } = useTableSort<FeatureFlag>(
    filteredFeatures,
    "key",
    "asc"
  )

  const renderSortIcon = (key: keyof FeatureFlag) => {
    if (sortConfig.key !== key) {
      return (
        <ArrowUpDown className="ml-1.5 size-3.5 text-muted-foreground/60" />
      )
    }
    if (sortConfig.order === "asc") {
      return <ArrowUp className="ml-1.5 size-3.5 text-primary" />
    }
    return <ArrowDown className="ml-1.5 size-3.5 text-primary" />
  }

  const handleToggle = (flag: FeatureFlag) => {
    updateMutation.mutate({
      key: flag.key,
      body: { enabled: !flag.enabled },
    })
  }

  const handleDeleteClick = (flag: FeatureFlag) => {
    setDeleteTarget(flag)
    setDeleteOpen(true)
  }

  const handleRampClick = (flag: FeatureFlag) => {
    setRampTarget(flag)
    setRampOpen(true)
  }

  const handleSimulateClick = (flag: FeatureFlag) => {
    setSimulateTarget(flag)
    setSimulateOpen(true)
  }

  const getRolloutStageBadge = (flag: FeatureFlag) => {
    if (!flag.enabled) {
      return (
        <Badge variant="secondary" className="font-mono text-[10px]">
          OFF
        </Badge>
      )
    }
    if (flag.rolloutPercentage === 100) {
      return (
        <Badge
          variant="default"
          className="bg-emerald-600 font-mono text-[10px] dark:bg-emerald-500"
        >
          100% GA
        </Badge>
      )
    }
    if (flag.rolloutPercentage === 0) {
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 font-mono text-[10px] text-amber-600 dark:text-amber-400"
        >
          0% VIP
        </Badge>
      )
    }
    if (flag.rolloutPercentage <= 10) {
      return (
        <Badge
          variant="outline"
          className="border-primary/30 font-mono text-[10px] text-primary"
        >
          {flag.rolloutPercentage}% Canary
        </Badge>
      )
    }
    if (flag.rolloutPercentage <= 25) {
      return (
        <Badge
          variant="outline"
          className="border-primary/30 font-mono text-[10px] text-primary"
        >
          {flag.rolloutPercentage}% Early
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className="border-primary/30 font-mono text-[10px] text-primary"
      >
        {flag.rolloutPercentage}% Majority
      </Badge>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {features.length} flags
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Control remote feature rollouts, device VIP whitelists, and 7-gate
            targeting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <HelpButton
            onClick={() => setHelpOpen(true)}
            label="Operations Guide"
            badge="Playbooks"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh feature flags"
            className="cursor-pointer"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            onClick={() => navigate(`/${appSlug}/features/add`)}
            className="cursor-pointer font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" /> New Feature Flag
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview Cards (Clickable) */}
      <FeatureStatsOverview
        features={features}
        activeFilter={metricFilter}
        onSelectFilter={setMetricFilter}
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="max-w-sm min-w-50 flex-1">
          <InputGroupAddon align="inline-start">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search key or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs"
          />
        </InputGroup>

        {/* Platform Filter */}
        <div className="w-37.5">
          <SelectComponent
            value={platformFilter}
            onValueChange={(val) => setPlatformFilter(val || "all")}
            placeholder="Platform"
            title="Platform"
            data={[
              { name: "All Platforms", value: "all" },
              { name: "Android", value: "android" },
              { name: "iOS", value: "ios" },
            ]}
          />
        </div>

        {/* State Filter */}
        <div className="w-35">
          <SelectComponent
            value={stateFilter}
            onValueChange={(val) => setStateFilter(val || "all")}
            placeholder="Status"
            title="Status"
            data={[
              { name: "All States", value: "all" },
              { name: "Active (On)", value: "active" },
              { name: "Disabled (Off)", value: "disabled" },
            ]}
          />
        </div>

        {metricFilter !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMetricFilter("all")}
            className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Card Filter &times;
          </Button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-16 font-semibold">State</TableHead>
              <TableHead
                className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                onClick={() => requestSort("key")}
              >
                <div className="flex items-center">
                  <span>Feature Key</span>
                  {renderSortIcon("key")}
                </div>
              </TableHead>
              <TableHead className="font-semibold">Targeting</TableHead>
              <TableHead className="font-semibold">Channels</TableHead>
              <TableHead className="font-semibold">Rollout Stage</TableHead>
              <TableHead className="font-semibold">Overrides</TableHead>
              <TableHead className="font-semibold">Payload</TableHead>
              <TableHead
                className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                onClick={() => requestSort("createdAt")}
              >
                <div className="flex items-center">
                  <span>Created</span>
                  {renderSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader size={24} />
                    <p className="text-sm">Loading feature flags...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Flag className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium">
                      {searchQuery ||
                      platformFilter !== "all" ||
                      stateFilter !== "all" ||
                      metricFilter !== "all"
                        ? "No feature flags matched your active filters."
                        : "No feature flags have been defined yet."}
                    </p>
                    {!searchQuery &&
                      platformFilter === "all" &&
                      stateFilter === "all" &&
                      metricFilter === "all" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate(`/${appSlug}/features/add`)}
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" /> Define your
                          first feature flag
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((flag) => {
                const payloadKeyCount = flag.payload
                  ? Object.keys(flag.payload).length
                  : 0
                const allowCount = flag.allowDevices
                  ? flag.allowDevices.length
                  : 0
                const denyCount = flag.denyDevices ? flag.denyDevices.length : 0

                return (
                  <TableRow key={flag._id || flag.key}>
                    {/* 1. Inline Master Switch */}
                    <TableCell>
                      <div className="flex items-center">
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => handleToggle(flag)}
                          disabled={updateMutation.isPending}
                          aria-label={`Toggle feature ${flag.key}`}
                          className="cursor-pointer"
                        />
                      </div>
                    </TableCell>

                    {/* 2. Key and Description */}
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {flag.key}
                          </span>
                          {flag.enabled ? (
                            <Badge
                              variant="default"
                              className="bg-emerald-500/15 text-[10px] text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              Disabled
                            </Badge>
                          )}
                        </div>
                        {flag.description && (
                          <p className="mt-0.5 line-clamp-1 max-w-xs text-[11px] text-muted-foreground">
                            {flag.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* 3. Targeting: Platform & Build Ranges */}
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="inline-flex items-center text-[11px] font-normal capitalize"
                        >
                          {!flag.platforms ||
                          flag.platforms.length === 0 ||
                          (flag.platforms.includes("android") &&
                            flag.platforms.includes("ios")) ? (
                            "All OS"
                          ) : flag.platforms.includes("android") ? (
                            <>
                              <IconBrandAndroid className="mr-1 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              Android
                            </>
                          ) : (
                            <>
                              <IconBrandApple className="mr-1 h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                              iOS
                            </>
                          )}
                        </Badge>

                        {(flag.minBuildNumber?.android ||
                          flag.minBuildNumber?.ios ||
                          flag.maxBuildNumber?.android ||
                          flag.maxBuildNumber?.ios) && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {flag.minBuildNumber?.android &&
                              `A:#${flag.minBuildNumber.android}+ `}
                            {flag.minBuildNumber?.ios &&
                              `iOS:#${flag.minBuildNumber.ios}+`}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 4. Channels */}
                    <TableCell>
                      {!flag.channels || flag.channels.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">
                          All
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {flag.channels.map((ch) => (
                            <Badge
                              key={ch}
                              variant="secondary"
                              className="px-1.5 py-0 font-mono text-[9px] capitalize"
                            >
                              {ch}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    {/* 5. Rollout Stage Gauge */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getRolloutStageBadge(flag)}
                        </div>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full ${
                              flag.rolloutPercentage === 100
                                ? "bg-emerald-600 dark:bg-emerald-500"
                                : flag.rolloutPercentage === 0
                                  ? "bg-muted-foreground"
                                  : "bg-primary"
                            }`}
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* 6. Overrides (VIP Whitelist & Emergency Denylist) */}
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {allowCount > 0 ? (
                          <Badge
                            variant="outline"
                            className="gap-1 border-amber-500/40 font-mono text-[10px] text-amber-600 dark:text-amber-400"
                            title={`VIP Allow List: ${flag.allowDevices?.join(", ")}`}
                          >
                            <Zap className="size-2.5" />+{allowCount} VIP
                          </Badge>
                        ) : null}

                        {denyCount > 0 ? (
                          <Badge
                            variant="destructive"
                            className="gap-1 font-mono text-[10px]"
                            title={`Emergency Deny List: ${flag.denyDevices?.join(", ")}`}
                          >
                            <ShieldAlert className="size-2.5" />!{denyCount}{" "}
                            Deny
                          </Badge>
                        ) : null}

                        {allowCount === 0 && denyCount === 0 && (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 7. Payload summary with popover */}
                    <TableCell>
                      {payloadKeyCount > 0 ? (
                        <Popover>
                          <PopoverTrigger
                            render={
                              <Badge
                                variant="outline"
                                className="cursor-pointer gap-1 font-mono text-[11px] hover:bg-muted"
                              >
                                <FileCode2 className="size-3 text-muted-foreground" />
                                {payloadKeyCount}{" "}
                                {payloadKeyCount === 1 ? "key" : "keys"}
                              </Badge>
                            }
                          />
                          <PopoverContent className="w-64 p-3 font-mono text-xs">
                            <div className="mb-1 text-[11px] font-bold text-foreground">
                              Payload Parameters:
                            </div>
                            <pre className="overflow-x-auto rounded bg-muted/40 p-2 text-[10px] leading-relaxed">
                              {JSON.stringify(flag.payload, null, 2)}
                            </pre>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* 8. Created Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {flag.createdAt
                        ? format(new Date(flag.createdAt), "MMM d, yyyy")
                        : "—"}
                    </TableCell>

                    {/* 9. Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Ramp Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRampClick(flag)}
                          title="Advance canary rollout"
                          className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          <Sliders className="size-3.5" />
                          <span className="sr-only">Ramp Rollout</span>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreVerticalIcon className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent
                            align="end"
                            className="w-40 text-xs"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `/${appSlug}/features/update/${flag.key}`
                                )
                              }
                              className="cursor-pointer gap-2"
                            >
                              <Edit className="size-3.5" /> Edit Flag
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleRampClick(flag)}
                              className="cursor-pointer gap-2"
                            >
                              <Sliders className="size-3.5" /> Adjust Rollout %
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleSimulateClick(flag)}
                              className="cursor-pointer gap-2 text-primary focus:text-primary"
                            >
                              <Play className="size-3.5" /> Test in Simulator
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(flag)}
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5" /> Delete Flag
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <DeleteFeatureDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        feature={deleteTarget}
      />

      {/* Quick Rollout Ramp Dialog */}
      <FeatureQuickRampDialog
        open={rampOpen}
        onOpenChange={setRampOpen}
        feature={rampTarget}
      />

      {/* Slide-over Help & Operations Guide Drawer */}
      <FeatureHelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />

      {/* Standalone Simulator Dialog */}
      {simulateTarget && (
        <Dialog open={simulateOpen} onOpenChange={setSimulateOpen}>
          <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
            <FeatureSimulatorCard flagConfig={simulateTarget} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default FeatureList
