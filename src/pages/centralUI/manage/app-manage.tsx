import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  ArrowLeft,
  Plus,
  Search,
  RefreshCw,
  MoreVerticalIcon,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Globe,
  LogOut,
} from "lucide-react"

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
import Loader from "@/components/loader"
import SelectComponent from "@/components/inputComponents/select-component"
import { ModeToggle } from "@/components/mode-toggle"
import { appData } from "@/app/appData"

import { useGetApps } from "@/query/useAppInfo"
import { useAppStore } from "@/store"
import { useTableSort } from "@/hooks/useTableSort"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/utils/getErrorMessage"
import type { AppInfo } from "@/utils/schemas/appInfoSchema"

import AppDialog from "./app-dialog"
import DeleteAppDialog from "./delete-app"

export default function AppManagePage() {
  const navigate = useNavigate()
  const setSelectedApp = useAppStore((state) => state.setSelectedApp)
  const clearAuth = useAppStore((state) => state.clearAuth)
  const clearApp = useAppStore((state) => state.clearApp)

  const handleLogout = () => {
    clearAuth()
    clearApp()
    navigate("/login")
  }

  // Filter & Pagination States

  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 20

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [editingApp, setEditingApp] = useState<AppInfo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AppInfo | null>(null)
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setCurrentPage(1) // Reset to first page on search change
    }, 300)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Build query params for server
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      limit: pageSize,
    }
    if (debouncedSearch) {
      params.appName = debouncedSearch
    }
    return params
  }, [currentPage, pageSize, debouncedSearch])

  // Query apps from Central-Backend
  const {
    data: appsResp,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetApps({
    params: queryParams,
  })

  // Extract application array safely (supports { status: 200, data: { data: [...] } })
  const rawAppsList: AppInfo[] = useMemo(() => {
    if (Array.isArray(appsResp?.data?.data)) return appsResp.data.data
    if (Array.isArray(appsResp?.data))
      return appsResp.data as unknown as AppInfo[]
    return []
  }, [appsResp])

  // Pagination metadata from server response
  const pagination = useMemo(() => {
    const p =
      appsResp?.data?.pagination ||
      (
        appsResp as unknown as {
          pagination?: {
            total?: number
            page?: number
            limit?: number
            totalPages?: number
          }
        }
      )?.pagination
    return {
      total: p?.total ?? rawAppsList.length,
      page: p?.page ?? currentPage,
      limit: p?.limit ?? pageSize,
      totalPages:
        p?.totalPages ?? Math.max(1, Math.ceil(rawAppsList.length / pageSize)),
    }
  }, [appsResp, rawAppsList.length, currentPage, pageSize])

  // Client-side status filtering if needed
  const filteredApps = useMemo(() => {
    if (statusFilter === "all") return rawAppsList
    return rawAppsList.filter((a) => a.status === statusFilter)
  }, [rawAppsList, statusFilter])

  // Client-side sorting via useTableSort
  const { sortedItems, sortConfig, requestSort } = useTableSort<AppInfo>(
    filteredApps,
    "createdAt",
    "desc"
  )

  const renderSortIcon = (key: keyof AppInfo) => {
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

  // Handle open workspace
  const handleOpenWorkspace = (app: AppInfo) => {
    setSelectedApp(app)
    navigate(`/${app.appName.toLowerCase()}/home`)
  }

  // Handle copy URL
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success("URL copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Utility Bar */}
      <header className="flex h-14 items-center justify-between border-b px-6">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {appData.appName}
        </span>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl flex-1 p-6 md:p-8">
        <div className="flex flex-1 flex-col gap-6">
          {/* Page Header */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/apps")}
                title="Back to Catalog"
                aria-label="Back to Catalog"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div className="flex flex-col gap-1 text-left">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Application Management
                  </h1>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {pagination.total} {pagination.total === 1 ? "app" : "apps"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Register, configure backend base URLs, and manage Central
                  workspaces.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh applications"
              >
                <RefreshCw
                  className={cn("size-4", isFetching && "animate-spin")}
                />
              </Button>

              <Button
                onClick={() => {
                  setEditingApp(null)
                  setDialogOpen(true)
                }}
              >
                <Plus className="mr-2 size-4" />
                Add App
              </Button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by app name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Status:
              </span>
              <div className="w-36">
                <SelectComponent
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  data={[
                    { name: "All Statuses", value: "all" },
                    { name: "Active", value: "active" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {isError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              Failed to load applications: {getErrorMessage(error)}
            </div>
          )}

          {/* Table Section */}
          <div className="rounded-md border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer font-semibold"
                    onClick={() => requestSort("appName")}
                  >
                    <div className="flex items-center">
                      App Name
                      {renderSortIcon("appName")}
                    </div>
                  </TableHead>

                  <TableHead className="font-semibold">
                    Backend Base URL
                  </TableHead>

                  <TableHead
                    className="cursor-pointer font-semibold"
                    onClick={() => requestSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {renderSortIcon("status")}
                    </div>
                  </TableHead>

                  <TableHead
                    className="cursor-pointer font-semibold"
                    onClick={() => requestSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Created At
                      {renderSortIcon("createdAt")}
                    </div>
                  </TableHead>

                  <TableHead className="w-20 text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader size={28} />
                        <span className="text-xs text-muted-foreground">
                          Loading applications...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Layers className="size-8 stroke-1 text-muted-foreground/60" />
                        <p className="text-sm font-medium">
                          No applications found
                        </p>
                        <p className="text-xs">
                          {searchInput
                            ? "Try modifying your search criteria."
                            : "Get started by registering a new application."}
                        </p>
                        {!searchInput && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              setEditingApp(null)
                              setDialogOpen(true)
                            }}
                          >
                            <Plus className="mr-1.5 size-3.5" />
                            Register New App
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedItems.map((app) => (
                    <TableRow key={app._id} className="hover:bg-muted/50">
                      {/* App Name */}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30 text-primary">
                            {app.logo?.link ? (
                              <img
                                src={app.logo.link}
                                alt={app.appName}
                                className="size-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none"
                                }}
                              />
                            ) : (
                              <Globe className="size-4" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {app.appName}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              ID: {app._id}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Backend Base URL */}
                      <TableCell>
                        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                          <span
                            className="max-w-[280px] truncate"
                            title={app.backendBaseUrl}
                          >
                            {app.backendBaseUrl}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              handleCopyUrl(app.backendBaseUrl, app._id)
                            }
                            title="Copy URL"
                          >
                            {copiedId === app._id ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={
                            app.status === "active" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {app.status}
                        </Badge>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {app.createdAt
                          ? format(new Date(app.createdAt), "MMM d, yyyy HH:mm")
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
                                className="size-8"
                                title="Actions"
                              >
                                <MoreVerticalIcon className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => handleOpenWorkspace(app)}
                              className="cursor-pointer"
                            >
                              <ExternalLink className="mr-2 size-4" />
                              <span>Open Workspace</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setEditingApp(app)
                                setDialogOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 size-4" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteTarget(app)
                                setDeleteOpen(true)
                              }}
                              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="mr-2 size-4" />
                              <span>Delete App</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 py-2 sm:flex-row">
              <div className="text-xs text-muted-foreground">
                Showing{" "}
                <strong>{(pagination.page - 1) * pagination.limit + 1}</strong>{" "}
                to{" "}
                <strong>
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </strong>{" "}
                of <strong>{pagination.total}</strong> applications
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isFetching}
                >
                  <ChevronLeft className="mr-1 size-4" />
                  Previous
                </Button>
                <span className="px-2 font-mono text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(pagination.totalPages, p + 1)
                    )
                  }
                  disabled={currentPage >= pagination.totalPages || isFetching}
                >
                  Next
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit App Modal Dialog */}
      <AppDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        app={editingApp}
      />

      {/* Delete App Confirmation Dialog */}
      <DeleteAppDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        app={deleteTarget}
      />
    </div>
  )
}
