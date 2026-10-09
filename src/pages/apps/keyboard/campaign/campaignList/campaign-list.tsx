import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import { cn } from "@/lib/utils"
import { useGetCampaigns } from "@/query/keyboard/useCampaign"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
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

  // Filter list by name, platform identifiers, links, or extras
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return rawList
    const query = searchQuery.toLowerCase().trim()
    return rawList.filter((c) => {
      const matchName = c.name?.toLowerCase().includes(query)
      const matchAndroidPkg = c.android?.packageName?.toLowerCase().includes(query)
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
  }, [rawList, searchQuery])

  if (isLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3 p-8 text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading campaigns...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {rawList.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage promoted shortcuts, Android &amp; iOS targets, and recommendation icons
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

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, package, link, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-16">Icon</TableHead>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Android Target</TableHead>
              <TableHead>iOS Target</TableHead>
              <TableHead>Metadata / Extras</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium">
                      {searchQuery
                        ? "No campaigns matched your search filter."
                        : "No campaigns registered yet."}
                    </p>
                    {!searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => navigate("/keyboard/campaign/add")}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Create your first campaign
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredList.map((campaign) => {
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
                          "capitalize text-xs font-medium",
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
                      {campaign.android?.packageName || campaign.android?.link ? (
                        <div className="flex flex-col gap-1 items-start max-w-50">
                          {campaign.android.packageName && (
                            <Badge
                              variant="outline"
                              className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]"
                            >
                              <IconBrandAndroid className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-37.5">
                                {campaign.android.packageName}
                              </span>
                            </Badge>
                          )}
                          {campaign.android.link && (
                            <a
                              href={campaign.android.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 truncate text-xs text-primary hover:underline max-w-45"
                              title={campaign.android.link}
                            >
                              <span className="truncate">{campaign.android.link}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </TableCell>

                    {/* iOS Target */}
                    <TableCell>
                      {campaign.ios?.packageName || campaign.ios?.link ? (
                        <div className="flex flex-col gap-1 items-start max-w-50">
                          {campaign.ios.packageName && (
                            <Badge
                              variant="outline"
                              className="gap-1 border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]"
                            >
                              <IconBrandApple className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-37.5">
                                {campaign.ios.packageName}
                              </span>
                            </Badge>
                          )}
                          {campaign.ios.link && (
                            <a
                              href={campaign.ios.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 truncate text-xs text-primary hover:underline max-w-45"
                              title={campaign.ios.link}
                            >
                              <span className="truncate">{campaign.ios.link}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-70" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </TableCell>

                    {/* Metadata Extras */}
                    <TableCell>
                      {campaign.extras &&
                      Object.keys(campaign.extras).length > 0 ? (
                        <div className="flex max-w-55 flex-wrap gap-1">
                          {Object.entries(campaign.extras).map(
                            ([key, val]) => (
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
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-xs italic text-muted-foreground/60">
                          None
                        </span>
                      )}
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {campaign.createdAt
                        ? new Date(campaign.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "-"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/keyboard/campaign/update/${campaignId}`
                              )
                            }
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

      {/* Delete Confirmation Dialog */}
      <DeleteCampaign
        campaign={selectedCampaign}
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setSelectedCampaign(null)
        }}
      />
    </div>
  )
}
