import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import { getErrorMessage } from "@/utils/getErrorMessage"
import { cn } from "@/lib/utils"
import { useGetCampaigns } from "@/query/keyboard/useCampaign"
import { useTableSort } from "@/hooks/useTableSort"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Loader from "@/components/loader"
import {
  MoreVerticalIcon,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { IconBrandAndroid, IconBrandApple } from "@tabler/icons-react"
import DeleteCampaign from "../delete-campaign"
import type { Campaign } from "@/utils/schemas/keyboard/campaignSchema"

export default function CampaignList() {
  const navigate = useNavigate()
  const {
    data: campaignsResp,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCampaigns()

  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  )
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (isError && error) {
      toast.error(getErrorMessage(error))
    }
  }, [isError, error])

  // Extract raw list from response envelope safely
  const rawList: Campaign[] = useMemo(() => {
    if (Array.isArray(campaignsResp?.data)) {
      return campaignsResp.data
    }
    if (Array.isArray(campaignsResp)) {
      return campaignsResp
    }
    return []
  }, [campaignsResp])

  // Filter list by platform, status, and search query
  const filteredList = useMemo(() => {
    let result = rawList

    // Platform Filter
    if (platformFilter === "android") {
      result = result.filter((c) => c.android?.packageName || c.android?.link)
    } else if (platformFilter === "ios") {
      result = result.filter((c) => c.ios?.packageName || c.ios?.link)
    }

    // Status Filter
    if (statusFilter !== "all") {
      result = result.filter((c) => (c.status || "active") === statusFilter)
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((c) => {
        const matchName = c.name?.toLowerCase().includes(query)
        const matchAndroidPkg = c.android?.packageName
          ?.toLowerCase()
          .includes(query)
        const matchAndroidLink = c.android?.link?.toLowerCase().includes(query)
        const matchIosPkg = c.ios?.packageName?.toLowerCase().includes(query)
        const matchIosLink = c.ios?.link?.toLowerCase().includes(query)
        const matchStatus = (c.status || "active").toLowerCase().includes(query)
        const matchExtras = c.extras
          ? JSON.stringify(c.extras).toLowerCase().includes(query)
          : false
        return (
          matchName ||
          matchStatus ||
          matchAndroidPkg ||
          matchAndroidLink ||
          matchIosPkg ||
          matchIosLink ||
          matchExtras
        )
      })
    }

    return result
  }, [rawList, platformFilter, statusFilter, searchQuery])

  // Sort list with useTableSort
  const { sortedItems, sortConfig, requestSort } = useTableSort<Campaign>(
    filteredList,
    "createdAt",
    "desc"
  )

  const renderSortIcon = (key: keyof Campaign) => {
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

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {rawList.length} campaigns
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage promoted shortcuts, Android &amp; iOS targets, and
            recommendation icons
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh campaigns"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={() => navigate("/keyboard/campaign/add")}>
            <Plus className="mr-2 h-4 w-4" /> Add Campaign
          </Button>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm min-w-50 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, package, link, or tag..."
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

        {/* Status Filter */}
        <div className="w-35">
          <SelectComponent
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "all")}
            placeholder="Status"
            title="Status"
            data={[
              { name: "All Statuses", value: "all" },
              { name: "Active", value: "active" },
              { name: "Inactive", value: "inactive" },
            ]}
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-16">Icon</TableHead>
              <TableHead
                className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                onClick={() => requestSort("name")}
              >
                <div className="flex items-center">
                  <span>Campaign Name</span>
                  {renderSortIcon("name")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer font-semibold transition-colors select-none hover:text-foreground"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIcon("status")}
                </div>
              </TableHead>
              <TableHead className="font-semibold">Android Target</TableHead>
              <TableHead className="font-semibold">iOS Target</TableHead>
              <TableHead className="font-semibold">Metadata / Extras</TableHead>
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
                    <p className="text-sm">Loading campaigns...</p>
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
                    <Layers className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium">
                      {searchQuery ||
                      platformFilter !== "all" ||
                      statusFilter !== "all"
                        ? "No campaigns matched your active filters."
                        : "No campaigns registered yet."}
                    </p>
                    {!searchQuery &&
                      platformFilter === "all" &&
                      statusFilter === "all" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate("/keyboard/campaign/add")}
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" /> Create your
                          first campaign
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((campaign) => {
                const campaignId = campaign._id || campaign.id || ""
                const iconUrl = campaign.icon?.link

                return (
                  <TableRow key={campaignId}>
                    {/* Icon */}
                    <TableCell>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/60">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={campaign.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = "none"
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>

                    {/* Name */}
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex flex-col">
                        <span>{campaign.name}</span>
                        {campaign._id && (
                          <span className="font-mono text-[10px] text-muted-foreground/70">
                            ID: {campaign._id}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium capitalize",
                          (campaign.status || "active") === "active"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {campaign.status || "active"}
                      </Badge>
                    </TableCell>

                    {/* Android Target */}
                    <TableCell>
                      {campaign.android?.packageName ||
                      campaign.android?.link ? (
                        <div className="flex max-w-50 flex-col items-start gap-1">
                          {campaign.android.packageName && (
                            <Badge
                              variant="outline"
                              className="gap-1 border-emerald-500/30 bg-emerald-500/10 font-mono text-[11px] text-emerald-600 dark:text-emerald-400"
                            >
                              <IconBrandAndroid className="h-3 w-3 shrink-0" />
                              <span className="max-w-37.5 truncate">
                                {campaign.android.packageName}
                              </span>
                            </Badge>
                          )}
                          {campaign.android.link && (
                            <a
                              href={campaign.android.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex max-w-45 items-center gap-1 truncate text-xs text-primary hover:underline"
                              title={campaign.android.link}
                            >
                              <span className="truncate">
                                {campaign.android.link}
                              </span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* iOS Target */}
                    <TableCell>
                      {campaign.ios?.packageName || campaign.ios?.link ? (
                        <div className="flex max-w-50 flex-col items-start gap-1">
                          {campaign.ios.packageName && (
                            <Badge
                              variant="outline"
                              className="gap-1 border-zinc-500/30 bg-zinc-500/10 font-mono text-[11px] text-zinc-700 dark:text-zinc-300"
                            >
                              <IconBrandApple className="h-3 w-3 shrink-0" />
                              <span className="max-w-37.5 truncate">
                                {campaign.ios.packageName}
                              </span>
                            </Badge>
                          )}
                          {campaign.ios.link && (
                            <a
                              href={campaign.ios.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex max-w-45 items-center gap-1 truncate text-xs text-primary hover:underline"
                              title={campaign.ios.link}
                            >
                              <span className="truncate">
                                {campaign.ios.link}
                              </span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* Metadata Extras */}
                    <TableCell>
                      {campaign.extras &&
                      Object.keys(campaign.extras).length > 0 ? (
                        <div className="flex max-w-55 flex-wrap gap-1">
                          {Object.entries(campaign.extras).map(([key, val]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className="px-1.5 py-0.5 text-[11px]"
                            >
                              <span className="font-medium text-muted-foreground">
                                {key}:
                              </span>{" "}
                              <span className="ml-1 text-foreground">
                                {typeof val === "object"
                                  ? JSON.stringify(val)
                                  : String(val)}
                              </span>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic">
                          None
                        </span>
                      )}
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                      {campaign.createdAt
                        ? format(new Date(campaign.createdAt), "MMM d, yyyy")
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
                                `/keyboard/campaign/update/${campaignId}`
                              )
                            }
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => {
                              setSelectedCampaign(campaign)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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

      {/* Delete Campaign Confirmation Modal */}
      <DeleteCampaign
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        campaign={selectedCampaign}
      />
    </div>
  )
}
