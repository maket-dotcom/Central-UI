import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  History,
  Layers,
  Sliders,
  FileCode2,
  MoreVerticalIcon,
  Table as TableIcon,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
import { useGetConfigs } from "@/query/keyboard/useRemoteConfig"
import { useTableSort } from "@/hooks/useTableSort"
import DeleteConfigDialog from "../delete-config"
import Loader from "@/components/loader"
import RemoteConfigHistoryDrawer from "../configHistory/remote-config-history-drawer"
import type {
  RemoteConfigDoc,
  ConfigPlatform,
} from "@/utils/schemas/keyboard/remoteConfigSchema"

type PlatformTab = "all" | "android" | "ios"
type ViewMode = "table" | "cards"

export default function RemoteConfigList() {
  const navigate = useNavigate()
  const { data: configsResp, isLoading, isFetching, refetch } = useGetConfigs()

  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  const [selectedTabs, setSelectedTabs] = useState<Record<string, PlatformTab>>(
    {}
  )
  const [deleteTarget, setDeleteTarget] = useState<RemoteConfigDoc | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [historyTarget, setHistoryTarget] = useState<{
    namespace: string
    platform: string
    version: number
  } | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const configs: RemoteConfigDoc[] = useMemo(() => {
    return Array.isArray(configsResp?.data) ? configsResp.data : []
  }, [configsResp])

  // Filter flat list for Table View
  const filteredConfigs = useMemo(() => {
    let result = configs

    // Platform Filter
    if (platformFilter === "baseline") {
      result = result.filter((doc) => doc.platform === "all")
    } else if (platformFilter !== "all") {
      result = result.filter((doc) => doc.platform === platformFilter)
    }

    // Search Query (matches namespace, platform, or JSON values/keys)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((doc) => {
        if (doc.namespace.toLowerCase().includes(q)) return true
        if (doc.platform.toLowerCase().includes(q)) return true
        return Object.entries(doc.values || {}).some(
          ([k, v]) =>
            k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)
        )
      })
    }

    return result
  }, [configs, platformFilter, searchQuery])

  // Sorting for Table View
  const { sortedItems, sortConfig, requestSort } =
    useTableSort<RemoteConfigDoc>(filteredConfigs, "namespace", "asc")

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

  // Group configs by namespace in memory (For optional Cards View)
  const groupedNamespaces = useMemo(() => {
    const map: Record<
      string,
      Record<ConfigPlatform, RemoteConfigDoc | undefined>
    > = {}

    configs.forEach((doc) => {
      if (!map[doc.namespace]) {
        map[doc.namespace] = {
          all: undefined,
          android: undefined,
          ios: undefined,
        }
      }
      map[doc.namespace][doc.platform] = doc
    })

    return map
  }, [configs])

  // Filter namespaces for Cards View
  const filteredNamespaceKeys = useMemo(() => {
    let keys = Object.keys(groupedNamespaces)

    // Platform Filter for Cards View
    if (platformFilter === "baseline") {
      keys = keys.filter((ns) => !!groupedNamespaces[ns].all)
    } else if (platformFilter === "android") {
      keys = keys.filter((ns) => !!groupedNamespaces[ns].android)
    } else if (platformFilter === "ios") {
      keys = keys.filter((ns) => !!groupedNamespaces[ns].ios)
    }

    if (!searchQuery.trim()) return keys
    const q = searchQuery.toLowerCase()

    return keys.filter((ns) => {
      if (ns.toLowerCase().includes(q)) return true
      const platforms = groupedNamespaces[ns]
      return Object.values(platforms).some((doc) => {
        if (!doc) return false
        return Object.keys(doc.values || {}).some((k) =>
          k.toLowerCase().includes(q)
        )
      })
    })
  }, [groupedNamespaces, searchQuery, platformFilter])

  const handleTabChange = (namespace: string, tab: PlatformTab) => {
    setSelectedTabs((prev) => ({
      ...prev,
      [namespace]: tab,
    }))
  }

  const handleOpenHistory = (doc: RemoteConfigDoc) => {
    setHistoryTarget({
      namespace: doc.namespace,
      platform: doc.platform,
      version: doc.version,
    })
    setHistoryOpen(true)
  }

  const handleOpenDelete = (doc: RemoteConfigDoc) => {
    setDeleteTarget(doc)
    setDeleteOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Remote Configuration
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {configs.length} documents
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Cloud key-value parameters with platform inheritance (All &rarr;
            Android / iOS overrides) and optimistic locking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh remote configurations"
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative max-w-sm min-w-55 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search namespace, key, or value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Platform Filter */}
          <div className="w-40">
            <SelectComponent
              value={platformFilter}
              onValueChange={(val) => setPlatformFilter(val || "all")}
              placeholder="Platform"
              title="Platform"
              data={[
                { name: "All Documents", value: "all" },
                { name: "Baseline (All)", value: "baseline" },
                { name: "Android Override", value: "android" },
                { name: "iOS Override", value: "ios" },
              ]}
            />
          </div>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("table")}
            className="h-8 w-8 cursor-pointer"
            title="Table View"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("cards")}
            className="h-8 w-8 cursor-pointer"
            title="Grouped Cards View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        /* TABLE VIEW (Standard across Central-UI) */
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead
                  className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                  onClick={() => requestSort("namespace")}
                >
                  <div className="flex items-center">
                    <span>Namespace</span>
                    {renderSortIcon("namespace")}
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Platform</TableHead>
                <TableHead
                  className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                  onClick={() => requestSort("version")}
                >
                  <div className="flex items-center">
                    <span>Version</span>
                    {renderSortIcon("version")}
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Build Bounds</TableHead>
                <TableHead className="font-semibold">Parameters</TableHead>
                <TableHead
                  className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                  onClick={() => requestSort("updatedAt")}
                >
                  <div className="flex items-center">
                    <span>Last Updated</span>
                    {renderSortIcon("updatedAt")}
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
                    colSpan={7}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader size={24} />
                      <p className="text-sm">
                        Loading remote configurations...
                      </p>
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
                          ? "No configurations matched your active filters."
                          : "No remote configurations defined yet."}
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
                sortedItems.map((doc) => {
                  const paramCount = Object.keys(doc.values || {}).length
                  const isBaseline = doc.platform === "all"

                  return (
                    <TableRow key={`${doc.namespace}-${doc.platform}`}>
                      {/* Namespace */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-foreground">
                            {doc.namespace}
                          </span>
                          {isBaseline && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-normal"
                            >
                              Baseline
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Platform */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="inline-flex items-center font-normal capitalize"
                        >
                          {doc.platform === "android" ? (
                            <>
                              <IconBrandAndroid className="mr-1 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              Android
                            </>
                          ) : doc.platform === "ios" ? (
                            <>
                              <IconBrandApple className="mr-1 h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                              iOS
                            </>
                          ) : (
                            "All (Baseline)"
                          )}
                        </Badge>
                      </TableCell>

                      {/* Version */}
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          v{doc.version}
                        </Badge>
                      </TableCell>

                      {/* Build Bounds */}
                      <TableCell>
                        {doc.minBuildNumber || doc.maxBuildNumber ? (
                          <span className="font-mono text-xs text-muted-foreground">
                            #{doc.minBuildNumber || 1} &ndash;{" "}
                            {doc.maxBuildNumber || "latest"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            All Builds
                          </span>
                        )}
                      </TableCell>

                      {/* Parameters Count */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="gap-1 font-mono text-[11px]"
                        >
                          <FileCode2 className="size-3 text-muted-foreground" />
                          {paramCount} {paramCount === 1 ? "key" : "keys"}
                        </Badge>
                      </TableCell>

                      {/* Updated At */}
                      <TableCell className="text-xs text-muted-foreground">
                        {doc.updatedAt
                          ? format(new Date(doc.updatedAt), "MMM d, yyyy HH:mm")
                          : "—"}
                      </TableCell>

                      {/* Actions Dropdown */}
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
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `/keyboard/remote-config/edit/${doc.namespace}/${doc.platform}`
                                )
                              }
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit Config
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenHistory(doc)}
                              className="cursor-pointer"
                            >
                              <History className="mr-2 h-4 w-4" /> Version
                              History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenDelete(doc)}
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
      ) : isLoading ? (
        /* CARDS VIEW LOADING STATE */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Loader size={24} />
          <p className="mt-2 text-sm">Loading remote configurations...</p>
        </div>
      ) : filteredNamespaceKeys.length === 0 ? (
        /* CARDS VIEW EMPTY STATE */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Sliders className="h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-medium">
            {searchQuery || platformFilter !== "all"
              ? "No configurations matched your active filters."
              : "No remote configurations defined yet."}
          </p>
        </div>
      ) : (
        /* CARDS VIEW LIST */
        <div className="grid grid-cols-1 gap-6">
          {filteredNamespaceKeys.map((namespace) => {
            const platformDocs = groupedNamespaces[namespace]
            const defaultTab: PlatformTab =
              platformFilter === "baseline"
                ? "all"
                : platformFilter === "android"
                  ? "android"
                  : platformFilter === "ios"
                    ? "ios"
                    : "all"
            const activeTab: PlatformTab = selectedTabs[namespace] || defaultTab
            const activeDoc = platformDocs[activeTab]

            const overrideCount =
              (platformDocs.android ? 1 : 0) + (platformDocs.ios ? 1 : 0)

            return (
              <div
                key={namespace}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                {/* Card Header */}
                <div className="flex flex-col gap-2 border-b bg-muted/40 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-base font-bold text-foreground">
                      {namespace}
                    </span>
                    <Badge variant="outline" className="text-xs font-normal">
                      {platformDocs.all ? "Baseline active" : "No baseline"}
                    </Badge>
                    {overrideCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {overrideCount} platform{" "}
                        {overrideCount === 1 ? "override" : "overrides"}
                      </Badge>
                    )}
                  </div>

                  {/* Platform Segmented Tabs */}
                  <div className="inline-flex self-start rounded-lg bg-muted p-1 text-muted-foreground sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleTabChange(namespace, "all")}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                        activeTab === "all"
                          ? "bg-background text-foreground shadow-xs"
                          : "hover:text-foreground"
                      }`}
                    >
                      <span>All (Baseline)</span>
                      {platformDocs.all && (
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabChange(namespace, "android")}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                        activeTab === "android"
                          ? "bg-background text-foreground shadow-xs"
                          : "hover:text-foreground"
                      }`}
                    >
                      <IconBrandAndroid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Android</span>
                      {platformDocs.android && (
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTabChange(namespace, "ios")}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                        activeTab === "ios"
                          ? "bg-background text-foreground shadow-xs"
                          : "hover:text-foreground"
                      }`}
                    >
                      <IconBrandApple className="size-3.5 text-zinc-600 dark:text-zinc-400" />
                      <span>iOS</span>
                      {platformDocs.ios && (
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tab Body */}
                <div className="p-5">
                  {activeDoc ? (
                    <div className="space-y-4">
                      {/* Document Meta Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="font-mono text-xs">
                            Version {activeDoc.version}
                          </Badge>

                          {(activeDoc.minBuildNumber ||
                            activeDoc.maxBuildNumber) && (
                            <Badge
                              variant="outline"
                              className="gap-1 font-mono text-xs"
                            >
                              <Layers className="size-3" />
                              Builds: {activeDoc.minBuildNumber ||
                                1} &ndash;{" "}
                              {activeDoc.maxBuildNumber || "latest"}
                            </Badge>
                          )}

                          <span className="text-xs text-muted-foreground">
                            Updated{" "}
                            {format(
                              new Date(activeDoc.updatedAt),
                              "MMM d, yyyy HH:mm"
                            )}
                          </span>
                        </div>

                        {/* Actions for active document */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenHistory(activeDoc)}
                            className="cursor-pointer gap-1.5"
                          >
                            <History className="size-3.5" />
                            History
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/keyboard/remote-config/edit/${activeDoc.namespace}/${activeDoc.platform}`
                              )
                            }
                            className="cursor-pointer gap-1.5"
                          >
                            <Edit className="size-3.5" />
                            Edit
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDelete(activeDoc)}
                            className="cursor-pointer gap-1.5 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Values Dictionary Viewer */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Parameters (
                            {Object.keys(activeDoc.values || {}).length} keys)
                          </span>
                        </div>

                        {Object.keys(activeDoc.values || {}).length === 0 ? (
                          <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                            No parameters defined in this document yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(activeDoc.values || {}).map(
                              ([key, val]) => (
                                <div
                                  key={key}
                                  className="flex flex-col justify-between rounded-md border bg-muted/20 p-2.5 font-mono text-xs"
                                >
                                  <span className="truncate font-semibold text-foreground">
                                    {key}
                                  </span>
                                  <span className="mt-1 text-[11px] break-all text-muted-foreground">
                                    {typeof val === "object"
                                      ? JSON.stringify(val)
                                      : String(val)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Empty state for the active tab */
                    <div className="flex flex-col items-center justify-between gap-4 rounded-lg border border-dashed p-6 text-center sm:flex-row sm:text-left">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {activeTab === "all"
                            ? `No baseline configuration for "${namespace}"`
                            : `No ${activeTab === "android" ? "Android" : "iOS"} override configured`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activeTab === "all"
                            ? "A baseline applies to all client platforms unless explicitly overridden."
                            : `Devices running on ${
                                activeTab === "android" ? "Android" : "iOS"
                              } will inherit parameters from the "All" baseline document.`}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/keyboard/remote-config/create?namespace=${namespace}&platform=${activeTab}`
                          )
                        }
                        className="shrink-0 cursor-pointer gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        {activeTab === "all"
                          ? "Create Baseline"
                          : `Create ${activeTab === "android" ? "Android" : "iOS"} Override`}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfigDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        config={deleteTarget}
      />

      {/* Version History & Rollback Drawer */}
      {historyTarget && (
        <RemoteConfigHistoryDrawer
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          namespace={historyTarget.namespace}
          platform={historyTarget.platform}
          currentVersion={historyTarget.version}
        />
      )}
    </div>
  )
}
