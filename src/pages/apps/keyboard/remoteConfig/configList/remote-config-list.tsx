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
  Copy,
  Trash2,
  Sliders,
  MoreVerticalIcon,
} from "lucide-react"
import { IconBrandAndroid, IconBrandApple } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import Loader from "@/components/loader"
import { useGetRemoteConfigs } from "@/query/keyboard/useRemoteConfig"
import { useTableSort } from "@/hooks/useTableSort"
import DeleteConfigDialog from "../delete-config"
import type {
  RemoteConfigDoc,
  ConfigPlatform,
} from "@/utils/schemas/keyboard/remoteConfigSchema"
import { format } from "date-fns"
import { HelpButton } from "@/components/helpTour"
import { RemoteConfigHelpDrawer } from "../components/remote-config-help-drawer"

export const RemoteConfigList: React.FC = () => {
  const navigate = useNavigate()

  // Filter States
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<RemoteConfigDoc | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Operations Guide Drawer State
  const [helpOpen, setHelpOpen] = useState(false)

  // API query params
  const queryParams = useMemo(() => {
    if (platformFilter !== "all") {
      return { platform: platformFilter as ConfigPlatform }
    }
    return undefined
  }, [platformFilter])

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useGetRemoteConfigs(queryParams)

  const configs: RemoteConfigDoc[] = useMemo(() => {
    return Array.isArray(response?.data) ? response.data : []
  }, [response])

  // Partition configs by platform to compute active build windows
  const platformConfigs = useMemo(() => {
    const androidConfigs = configs
      .filter((c) => c.platform === "android")
      .sort((a, b) => b.minBuildNumber - a.minBuildNumber)
    const iosConfigs = configs
      .filter((c) => c.platform === "ios")
      .sort((a, b) => b.minBuildNumber - a.minBuildNumber)
    return { android: androidConfigs, ios: iosConfigs }
  }, [configs])

  const getBuildWindowLabel = (item: RemoteConfigDoc) => {
    const list = platformConfigs[item.platform as "android" | "ios"] || []
    const idx = list.findIndex((c) => c._id === item._id)
    if (idx === -1) return `Build #${item.minBuildNumber}+`
    if (idx === 0) return `Build #${item.minBuildNumber}+ (Latest)`
    const prev = list[idx - 1]
    const ceiling = prev.minBuildNumber - 1
    if (ceiling === item.minBuildNumber) {
      return `Build #${item.minBuildNumber}`
    }
    return `Build #${item.minBuildNumber} – #${ceiling}`
  }

  // Client-side text filter
  const filteredConfigs = useMemo(() => {
    if (!searchQuery.trim()) return configs
    const q = searchQuery.toLowerCase().trim()
    return configs.filter(
      (c) =>
        String(c.minBuildNumber).includes(q) ||
        (c.note && c.note.toLowerCase().includes(q)) ||
        c.platform.toLowerCase().includes(q) ||
        Object.keys(c.values || {}).some((k) => k.toLowerCase().includes(q))
    )
  }, [configs, searchQuery])

  // Client-side sorting via useTableSort
  const { sortedItems, sortConfig, requestSort } = useTableSort<RemoteConfigDoc>(
    filteredConfigs,
    "minBuildNumber",
    "desc"
  )

  const renderSortIcon = (key: keyof RemoteConfigDoc) => {
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

  const handleDeleteClick = (cfg: RemoteConfigDoc) => {
    setDeleteTarget(cfg)
    setDeleteOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Remote Configurations
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {configs.length} configs
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage version-tiered runtime configurations delivered to mobile
            clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <HelpButton
            onClick={() => setHelpOpen(true)}
            label="Operations Guide & Help"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh configurations"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={() => navigate("/keyboard/remote-config/create")}>
            <Plus className="mr-2 h-4 w-4" /> New Configuration
          </Button>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative max-w-sm min-w-50 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search min build, release note, keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Platform Filter */}
        <div className="w-35">
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
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead
                className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                onClick={() => requestSort("platform")}
              >
                <div className="flex items-center">
                  <span>Platform</span>
                  {renderSortIcon("platform")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                onClick={() => requestSort("minBuildNumber")}
              >
                <div className="flex items-center">
                  <span>Minimum Build</span>
                  {renderSortIcon("minBuildNumber")}
                </div>
              </TableHead>
              <TableHead className="font-semibold">Active Window</TableHead>
              <TableHead className="font-semibold">Release Note / Tag</TableHead>
              <TableHead className="font-semibold">Keys Count</TableHead>
              <TableHead
                className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                onClick={() => requestSort("createdAt")}
              >
                <div className="flex items-center">
                  <span>Created</span>
                  {renderSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader size={24} />
                    <p className="text-sm">Loading configurations...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Sliders className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium">
                      {searchQuery || platformFilter !== "all"
                        ? "No remote configurations matched your active filters."
                        : "No remote configurations have been created yet."}
                    </p>
                    {!searchQuery && platformFilter === "all" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          navigate("/keyboard/remote-config/create")
                        }
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Create your
                        first configuration
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((config) => {
                return (
                  <TableRow key={config._id}>
                    {/* Platform */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="inline-flex items-center font-normal capitalize"
                      >
                        {config.platform === "android" ? (
                          <IconBrandAndroid className="mr-1 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <IconBrandApple className="mr-1 h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                        )}
                        {config.platform}
                      </Badge>
                    </TableCell>

                    {/* Minimum Build Number */}
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        #{config.minBuildNumber}
                      </span>
                    </TableCell>

                    {/* Active Window */}
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs font-normal"
                      >
                        {getBuildWindowLabel(config)}
                      </Badge>
                    </TableCell>

                    {/* Release Note / Tag */}
                    <TableCell>
                      {config.note ? (
                        <span className="text-xs font-medium text-foreground">
                          {config.note}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No note
                        </span>
                      )}
                    </TableCell>

                    {/* Keys Count */}
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {Object.keys(config.values || {}).length} keys
                      </Badge>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {config.createdAt
                        ? format(new Date(config.createdAt), "MMM d, yyyy")
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
                              navigate(
                                `/keyboard/remote-config/edit/${config._id}`
                              )
                            }
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/keyboard/remote-config/create?cloneFrom=${config._id}`
                              )
                            }
                            className="cursor-pointer"
                          >
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(config)}
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
      <DeleteConfigDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        config={deleteTarget}
      />

      {/* Operations Guide Bottom Drawer */}
      <RemoteConfigHelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  )
}

export default RemoteConfigList
