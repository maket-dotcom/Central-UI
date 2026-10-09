import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
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
} from "lucide-react"
import { IconBrandAndroid, IconBrandApple } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import SelectComponent from "@/components/inputComponents/select-component"
import { useGetFeatures, useUpdateFeature } from "@/query/keyboard/useFeature"
import { useTableSort } from "@/hooks/useTableSort"
import DeleteFeatureDialog from "../delete-feature"
import Loader from "@/components/loader"
import type { FeatureFlag } from "@/utils/schemas/keyboard/featureSchema"
import { format } from "date-fns"

export const FeatureList: React.FC = () => {
  const navigate = useNavigate()
  const {
    data: featuresResp,
    isLoading,
    isFetching,
    refetch,
  } = useGetFeatures()
  const updateMutation = useUpdateFeature()

  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [deleteTarget, setDeleteTarget] = useState<FeatureFlag | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const features: FeatureFlag[] = useMemo(() => {
    return Array.isArray(featuresResp?.data) ? featuresResp.data : []
  }, [featuresResp])

  // Filter features
  const filteredFeatures = useMemo(() => {
    let result = features

    if (platformFilter !== "all") {
      result = result.filter(
        (f) =>
          f.platforms &&
          f.platforms.includes(platformFilter as "android" | "ios")
      )
    }

    if (stateFilter !== "all") {
      result = result.filter((f) =>
        stateFilter === "active" ? f.enabled : !f.enabled
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (f) =>
          f.key.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      )
    }

    return result
  }, [features, platformFilter, stateFilter, searchQuery])

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
            Control feature releases across platforms, channels, build
            thresholds, and percentage rollouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh feature flags"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={() => navigate("/keyboard/features/add")}>
            <Plus className="mr-2 h-4 w-4" /> New Feature Flag
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm min-w-50 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search key or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

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
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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
              <TableHead className="font-semibold">Rollout</TableHead>
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
                  colSpan={8}
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
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Flag className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium">
                      {searchQuery ||
                      platformFilter !== "all" ||
                      stateFilter !== "all"
                        ? "No feature flags matched your active filters."
                        : "No feature flags have been defined yet."}
                    </p>
                    {!searchQuery &&
                      platformFilter === "all" &&
                      stateFilter === "all" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate("/keyboard/features/add")}
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

                return (
                  <TableRow key={flag._id || flag.key}>
                    {/* Inline Master Switch */}
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

                    {/* Key and Description */}
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-foreground">
                            {flag.key}
                          </span>
                          {flag.enabled ? (
                            <Badge
                              variant="default"
                              className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </div>
                        {flag.description && (
                          <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-muted-foreground">
                            {flag.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Targeting: Platform & Build Ranges */}
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="inline-flex items-center font-normal capitalize"
                        >
                          {!flag.platforms ||
                          flag.platforms.length === 0 ||
                          (flag.platforms.includes("android") &&
                            flag.platforms.includes("ios")) ? (
                            "All Platforms"
                          ) : flag.platforms.includes("android") ? (
                            <>
                              <IconBrandAndroid className="mr-1 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              Android
                            </>
                          ) : (
                            <>
                              <IconBrandApple className="mr-1 h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                              iOS
                            </>
                          )}
                        </Badge>
                        {(flag.minBuildNumber?.android ||
                          flag.minBuildNumber?.ios ||
                          flag.maxBuildNumber?.android ||
                          flag.maxBuildNumber?.ios) && (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {flag.minBuildNumber?.android &&
                              `A:#${flag.minBuildNumber.android}+ `}
                            {flag.minBuildNumber?.ios &&
                              `iOS:#${flag.minBuildNumber.ios}+`}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Channels */}
                    <TableCell>
                      {!flag.channels || flag.channels.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">
                          None
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {flag.channels.map((ch) => (
                            <Badge
                              key={ch}
                              variant="secondary"
                              className="px-1.5 py-0 font-mono text-[10px] capitalize"
                            >
                              {ch}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    {/* Rollout % */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full ${
                              flag.rolloutPercentage === 100
                                ? "bg-primary"
                                : flag.rolloutPercentage === 0
                                  ? "bg-muted-foreground"
                                  : "bg-amber-500"
                            }`}
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {flag.rolloutPercentage}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Payload summary */}
                    <TableCell>
                      {payloadKeyCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="gap-1 font-mono text-[11px]"
                        >
                          <FileCode2 className="size-3 text-muted-foreground" />
                          {payloadKeyCount}{" "}
                          {payloadKeyCount === 1 ? "key" : "keys"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Created */}
                    <TableCell className="text-xs text-muted-foreground">
                      {flag.createdAt
                        ? format(new Date(flag.createdAt), "MMM d, yyyy")
                        : "—"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/keyboard/features/update/${flag.key}`)
                            }
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(flag)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
    </div>
  )
}

export default FeatureList
