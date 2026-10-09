import { useState, useMemo } from "react"
import { format } from "date-fns"
import {
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Edit,
  Trash2,
  Smartphone,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVerticalIcon,
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
import SelectComponent from "@/components/inputComponents/select-component"
import Loader from "@/components/loader"
import { useGetTesters } from "@/query/keyboard/useTester"
import { useTableSort } from "@/hooks/useTableSort"
import TesterDialog from "../addEditTester/tester-dialog"
import DeleteTesterDialog from "../delete-tester"
import type { Tester } from "@/utils/schemas/keyboard/testerSchema"

export default function TesterList() {
  const { data: testersResp, isLoading, isFetching, refetch } = useGetTesters()

  const [searchQuery, setSearchQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTester, setEditingTester] = useState<Tester | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingTester, setDeletingTester] = useState<Tester | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const testers: Tester[] = useMemo(() => {
    return Array.isArray(testersResp?.data) ? testersResp.data : []
  }, [testersResp])

  const filteredTesters = useMemo(() => {
    let result = testers
    if (channelFilter !== "all") {
      result = result.filter((t) => t.channel === channelFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.deviceId.toLowerCase().includes(q) ||
          (t.name && t.name.toLowerCase().includes(q)) ||
          t.channel.toLowerCase().includes(q)
      )
    }
    return result
  }, [testers, channelFilter, searchQuery])

  const { sortedItems, sortConfig, requestSort } = useTableSort<Tester>(
    filteredTesters,
    "createdAt",
    "desc"
  )

  const handleCopy = (deviceId: string) => {
    navigator.clipboard.writeText(deviceId)
    setCopiedId(deviceId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenAdd = () => {
    setEditingTester(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (tester: Tester) => {
    setEditingTester(tester)
    setDialogOpen(true)
  }

  const handleOpenDelete = (tester: Tester) => {
    setDeletingTester(tester)
    setDeleteOpen(true)
  }

  const renderSortIcon = (key: keyof Tester) => {
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
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Tester Devices
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {testers.length} enrolled
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage device identifiers enrolled in internal QA and beta release
            channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh testers"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Enroll Tester
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm min-w-50 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by device ID, name, or channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Channel Filter */}
        <div className="w-40">
          <SelectComponent
            value={channelFilter}
            onValueChange={(val) => setChannelFilter(val || "all")}
            placeholder="Channel"
            title="Channel"
            data={[
              { name: "All Channels", value: "all" },
              { name: "Internal (QA)", value: "internal" },
              { name: "Beta", value: "beta" },
            ]}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead
                onClick={() => requestSort("deviceId")}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center font-semibold">
                  Device ID
                  {renderSortIcon("deviceId")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => requestSort("channel")}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center font-semibold">
                  Channel
                  {renderSortIcon("channel")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => requestSort("name")}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center font-semibold">
                  Name / Owner
                  {renderSortIcon("name")}
                </div>
              </TableHead>
              <TableHead
                onClick={() => requestSort("createdAt")}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center font-semibold">
                  Enrolled Date
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
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader size={24} />
                    <p className="text-sm">Loading tester devices...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Smartphone className="h-8 w-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium">
                      {searchQuery || channelFilter !== "all"
                        ? "No devices matched your active filters."
                        : "No tester devices enrolled yet."}
                    </p>
                    {!searchQuery && channelFilter === "all" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleOpenAdd}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Enroll your
                        first tester
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((tester) => (
                <TableRow key={tester._id || tester.deviceId}>
                  {/* Device ID with Copy Button */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="rounded border bg-muted/60 px-2 py-0.5 font-mono text-xs font-medium text-foreground">
                        {tester.deviceId}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(tester.deviceId)}
                        className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
                        title={
                          copiedId === tester.deviceId
                            ? "Copied!"
                            : "Copy Device ID"
                        }
                      >
                        {copiedId === tester.deviceId ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>

                  {/* Channel Badge */}
                  <TableCell>
                    <Badge
                      variant={
                        tester.channel === "internal" ? "default" : "secondary"
                      }
                      className="font-mono text-xs uppercase"
                    >
                      {tester.channel}
                    </Badge>
                  </TableCell>

                  {/* Friendly Name */}
                  <TableCell>
                    {tester.name ? (
                      <span className="text-sm font-medium text-foreground">
                        {tester.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </TableCell>

                  {/* Created At */}
                  <TableCell className="text-xs text-muted-foreground">
                    {tester.createdAt
                      ? format(new Date(tester.createdAt), "MMM d, yyyy HH:mm")
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
                          onClick={() => handleOpenEdit(tester)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDelete(tester)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      {/* Add / Edit Dialog */}
      <TesterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tester={editingTester}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTesterDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tester={deletingTester}
      />
    </div>
  )
}
