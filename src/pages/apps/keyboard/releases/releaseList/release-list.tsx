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
  Package,
  AlertTriangle,
  ExternalLink,
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
import { useGetReleases } from "@/query/keyboard/useRelease"
import { useTableSort } from "@/hooks/useTableSort"
import DeleteReleaseDialog from "../delete-release"
import type { Release } from "@/utils/schemas/keyboard/releaseSchema"
import { format } from "date-fns"

export const ReleaseList: React.FC = () => {
  const navigate = useNavigate()

  // Filter States
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<Release | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // API query params
  const queryParams = useMemo(() => {
    const p: { platform?: string; channel?: string; status?: string } = {}
    if (platformFilter !== "all") p.platform = platformFilter
    if (channelFilter !== "all") p.channel = channelFilter
    if (statusFilter !== "all") p.status = statusFilter
    return p
  }, [platformFilter, channelFilter, statusFilter])

  const {
    data: releasesResp,
    isLoading,
    isFetching,
    refetch,
  } = useGetReleases({
    params: queryParams,
  })

  const releases: Release[] = useMemo(() => {
    return Array.isArray(releasesResp?.data) ? releasesResp.data : []
  }, [releasesResp])

  // Client-side text filter
  const filteredReleases = useMemo(() => {
    if (!searchQuery.trim()) return releases
    const q = searchQuery.toLowerCase()
    return releases.filter(
      (rel) =>
        rel.version.toLowerCase().includes(q) ||
        String(rel.buildNumber).includes(q) ||
        (rel.changelog && rel.changelog.toLowerCase().includes(q))
    )
  }, [releases, searchQuery])

  // Client-side sorting via useTableSort
  const { sortedItems, sortConfig, requestSort } = useTableSort<Release>(
    filteredReleases,
    "createdAt",
    "desc"
  )

  const renderSortIcon = (key: keyof Release) => {
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

  const handleDeleteClick = (rel: Release) => {
    setDeleteTarget(rel)
    setDeleteOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">App Releases</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {releases.length} builds
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage application binaries, in-app update rollouts, channels, and
            force-update rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh releases"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={() => navigate("/keyboard/releases/add")}>
            <Plus className="mr-2 h-4 w-4" /> New Release
          </Button>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative max-w-sm min-w-50 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search version, build, notes..."
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

        {/* Channel Filter */}
        <div className="w-35">
          <SelectComponent
            value={channelFilter}
            onValueChange={(val) => setChannelFilter(val || "all")}
            placeholder="Channel"
            title="Channel"
            data={[
              { name: "All Channels", value: "all" },
              { name: "Internal (QA)", value: "internal" },
              { name: "Beta", value: "beta" },
              { name: "Production", value: "production" },
            ]}
          />
        </div>

        {/* Status Filter */}
        <div className="w-35">
          <SelectComponent
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "all")}
            placeholder="Status"
            title="Status"
            data={[
              { name: "All Statuses", value: "all" },
              { name: "Draft", value: "draft" },
              { name: "Active", value: "active" },
              { name: "Paused", value: "paused" },
              { name: "Archived", value: "archived" },
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
                onClick={() => requestSort("version")}
              >
                <div className="flex items-center">
                  <span>Version</span>
                  {renderSortIcon("version")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                onClick={() => requestSort("buildNumber")}
              >
                <div className="flex items-center">
                  <span>Build Number</span>
                  {renderSortIcon("buildNumber")}
                </div>
              </TableHead>
              <TableHead className="font-semibold">Platform</TableHead>
              <TableHead className="font-semibold">Channel</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Rollout</TableHead>
              <TableHead className="font-semibold">Update Type</TableHead>
              <TableHead
                className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                onClick={() => requestSort("createdAt")}
              >
                <div className="flex items-center">
                  <span>Published</span>
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
                    <p className="text-sm">Loading releases...</p>
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
                    <Package className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium">
                      {searchQuery ||
                      platformFilter !== "all" ||
                      channelFilter !== "all" ||
                      statusFilter !== "all"
                        ? "No releases matched your active filters."
                        : "No release binaries have been published yet."}
                    </p>
                    {!searchQuery &&
                      platformFilter === "all" &&
                      channelFilter === "all" &&
                      statusFilter === "all" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate("/keyboard/releases/add")}
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" /> Publish your
                          first release
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((rel) => {
                const isForce = rel.forceUpdate
                return (
                  <TableRow
                    key={
                      rel._id ||
                      `${rel.platform}-${rel.version}-${rel.buildNumber}`
                    }
                  >
                    {/* Version */}
                    <TableCell>
                      <div className="flex items-center gap-2 font-mono text-sm font-semibold text-foreground">
                        <span>v{rel.version}</span>
                        {rel.downloadUrl && (
                          <a
                            href={rel.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground transition-colors hover:text-primary"
                            title="Download Binary"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                      </div>
                    </TableCell>

                    {/* Build Number */}
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        #{rel.buildNumber}
                      </span>
                    </TableCell>

                    {/* Platform with brand icon */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="inline-flex items-center font-normal capitalize"
                      >
                        {rel.platform === "android" ? (
                          <IconBrandAndroid className="mr-1 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <IconBrandApple className="mr-1 h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                        )}
                        {rel.platform}
                      </Badge>
                    </TableCell>

                    {/* Channel */}
                    <TableCell>
                      <Badge
                        variant={
                          rel.channel === "production" ? "default" : "secondary"
                        }
                        className="font-mono text-xs capitalize"
                      >
                        {rel.channel}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant={
                          rel.status === "active"
                            ? "default"
                            : rel.status === "paused"
                              ? "destructive"
                              : "secondary"
                        }
                        className="font-mono text-xs capitalize"
                      >
                        {rel.status}
                      </Badge>
                    </TableCell>

                    {/* Rollout */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${rel.rolloutPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {rel.rolloutPercentage}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Update Type */}
                    <TableCell>
                      {isForce ? (
                        <Badge
                          variant="destructive"
                          className="gap-1 font-mono text-xs"
                        >
                          <AlertTriangle className="size-3" />
                          Force (min #{rel.minBuildNumber || 1})
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Flexible
                        </span>
                      )}
                    </TableCell>

                    {/* Published Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {rel.createdAt
                        ? format(new Date(rel.createdAt), "MMM d, yyyy")
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
                              navigate(`/keyboard/releases/update/${rel._id}`)
                            }
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(rel)}
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
      <DeleteReleaseDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        release={deleteTarget}
      />
    </div>
  )
}

export default ReleaseList
