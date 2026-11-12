import React, { useState, useEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Search,
  RefreshCw,
  Copy,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  Package,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import SelectComponent from "@/components/inputComponents/select-component"
import Loader from "@/components/loader"
import ThreeButtonPagination from "@/components/pagination/three-button-pagination"
import { useGetDeviceAppInventorySummary } from "@/query/keyboard/useInventory"
import { useTableSort } from "@/hooks/useTableSort"
import { getErrorMessage } from "@/utils/getErrorMessage"
import type {
  DeviceAppInventoryItem,
  InventoryPlatform,
} from "@/utils/schemas/keyboard/inventorySchema"

export const InventoryList: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // ─── Initialize State lazily from URL Search Parameters ───────────────────
  const [platform, setPlatform] = useState<InventoryPlatform>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("platform") === "ios" ? "ios" : "android"
  })
  const [page, setPage] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search)
    return Math.max(1, parseInt(params.get("page") || "1", 10) || 1)
  })
  const [limit, setLimit] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search)
    return Math.min(
      Math.max(1, parseInt(params.get("limit") || "25", 10) || 25),
      100
    )
  })

  // Local search input & debounced search state for URL sync
  const [searchState, setSearchState] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("search")?.trim() || ""
  })
  const [debouncedSearch, setDebouncedSearch] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("search")?.trim() || ""
  })
  const [copiedPackage, setCopiedPackage] = useState<string | null>(null)

  // ─── Debounced Search Handler ─────────────────────────────────────────────
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1)
      setDebouncedSearch(searchState.trim())
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchState])

  // ─── Synchronize State to URL Query Parameters ────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams()
    params.set("platform", platform)
    params.set("page", page.toString())
    params.set("limit", limit.toString())

    if (debouncedSearch) {
      params.set("search", debouncedSearch)
    }

    const newQuery = params.toString()
    const currentQuery = location.search.slice(1)

    if (newQuery !== currentQuery) {
      navigate(`${location.pathname}?${newQuery}`, { replace: true })
    }
  }, [
    platform,
    page,
    limit,
    debouncedSearch,
    navigate,
    location.pathname,
    location.search,
  ])

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetDeviceAppInventorySummary({
    params: {
      platform,
      page,
      limit,
    },
  })

  // Toast notification for errors (standard across all keyboard modules)
  useEffect(() => {
    if (isError && error) {
      toast.error(getErrorMessage(error))
    }
  }, [isError, error])

  const rawList: DeviceAppInventoryItem[] = useMemo(() => {
    return Array.isArray(response?.data?.data) ? response.data.data : []
  }, [response])

  // Dynamically receive dataMapping dictionary from backend
  const dataMapping: Record<string, string> = useMemo(() => {
    return response?.data?.dataMapping || {}
  }, [response])

  const pagination = useMemo(() => {
    return (
      response?.data?.pagination || {
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
    )
  }, [response, page, limit])

  // Filter list by debounced search query
  const filteredList = useMemo(() => {
    if (!debouncedSearch) return rawList
    const q = debouncedSearch.toLowerCase()
    return rawList.filter((item) => item.packageName.toLowerCase().includes(q))
  }, [rawList, debouncedSearch])

  // Sort list with standard useTableSort hook
  const { sortedItems, sortConfig, requestSort } =
    useTableSort<DeviceAppInventoryItem>(filteredList, "presentCount", "desc")

  const renderSortIcon = (key: keyof DeviceAppInventoryItem) => {
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

  const handleCopyPackage = (pkgName: string) => {
    navigator.clipboard.writeText(pkgName)
    setCopiedPackage(pkgName)
    setTimeout(() => setCopiedPackage(null), 2000)
  }

  const handlePlatformChange = (val: string) => {
    setPlatform(val as InventoryPlatform)
    setPage(1)
  }

  const total = pagination.total ?? 0
  const totalPages = pagination.totalPages ?? 0
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Client App Inventory</h1>
            <Badge variant="secondary" className="font-mono">
              {total} {total === 1 ? "package" : "packages"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Aggregate installed application detection counts across saved device advertising-ID inventories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger render={
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh inventory"
              >
                <RefreshCw
                  className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            } />
            <TooltipContent>Refresh inventory summary</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative max-w-sm min-w-50 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by package name..."
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Platform Filter */}
        <div className="w-37.5">
          <SelectComponent
            value={platform}
            onValueChange={handlePlatformChange}
            placeholder="Platform"
            title="Platform"
            data={[
              { name: "Android", value: "android" },
              { name: "iOS", value: "ios" },
            ]}
          />
        </div>

        {platform === "ios" && (
          <Badge
            variant="outline"
            className="border-amber-500/30 text-amber-600 dark:text-amber-400"
          >
            Upload API currently accepts Android only
          </Badge>
        )}
      </div>

      {/* Inventory Table with dynamic dataMapping headers and cells */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {Object.entries(dataMapping).map(([key, label]) => {
                const sortKey = key as keyof DeviceAppInventoryItem
                return (
                  <TableHead
                    key={key}
                    className="cursor-pointer select-none"
                    onClick={() => requestSort(sortKey)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{label}</span>
                      {renderSortIcon(sortKey)}
                      {key === "presentCount" && (
                        <Tooltip>
                          <TooltipTrigger render={
                            <Info className="ml-1 size-3 text-muted-foreground" />
                          } />
                          <TooltipContent className="max-w-xs text-xs">
                            Inventories currently detecting the package (latest observation).
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {key === "notPresentCount" && (
                        <Tooltip>
                          <TooltipTrigger render={
                            <Info className="ml-1 size-3 text-muted-foreground" />
                          } />
                          <TooltipContent className="max-w-xs text-xs">
                            Inventories that once observed the package and now have it marked not_seen.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={Object.keys(dataMapping).length || 3}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader size={24} />
                    <p className="text-sm text-muted-foreground">
                      Loading inventory summary...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={Object.keys(dataMapping).length || 3}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="size-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium">
                      {debouncedSearch
                        ? "No packages match your search filter."
                        : total === 0
                          ? `No inventory records found for platform "${platform}".`
                          : `Page ${page} is beyond available pages (${totalPages}).`}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <TableRow key={item.packageName}>
                  {Object.keys(dataMapping).map((key) => {
                    if (key === "packageName") {
                      return (
                        <TableCell key={key}>
                          <div className="flex items-center gap-2">
                            {platform === "android" ? (
                              <IconBrandAndroid className="size-4 shrink-0 text-emerald-500" />
                            ) : (
                              <IconBrandApple className="size-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="font-mono text-xs font-medium">
                              {item.packageName}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => handleCopyPackage(item.packageName)}
                              title="Copy package name"
                            >
                              {copiedPackage === item.packageName ? (
                                <Check className="size-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      )
                    }

                    if (key === "presentCount") {
                      return (
                        <TableCell key={key}>
                          <Badge
                            variant="outline"
                            className="border-emerald-500/30 font-mono text-emerald-600 dark:text-emerald-400"
                          >
                            {item.presentCount.toLocaleString()}
                          </Badge>
                        </TableCell>
                      )
                    }

                    if (key === "notPresentCount") {
                      return (
                        <TableCell key={key}>
                          <Badge variant="secondary" className="font-mono">
                            {item.notPresentCount.toLocaleString()}
                          </Badge>
                        </TableCell>
                      )
                    }

                    return (
                      <TableCell key={key}>
                        {String((item as unknown as Record<string, unknown>)[key] ?? "—")}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls with ThreeButtonPagination */}
      <div className="flex flex-col items-center justify-between gap-4 py-2 sm:flex-row">
        <div className="text-xs text-muted-foreground">
          {total > 0 ? (
            <>
              Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{" "}
              <strong>{total}</strong> distinct packages
            </>
          ) : (
            <span>0 packages</span>
          )}
        </div>

        <ThreeButtonPagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
        />
      </div>
    </div>
  )
}

export default InventoryList
