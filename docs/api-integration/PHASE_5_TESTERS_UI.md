# Phase 5: Tester Device Management UI

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/pages/apps/keyboard/testers/`  
> **Design Decision:** C Hybrid (Modal Dialog CRUD)

---

## 1. Objective

Build the complete Tester Device Management user interface under `src/pages/apps/keyboard/testers/` enabling admins to enroll and manage hardware devices for `internal` QA and `beta` rings.

---

## 2. Component Structure

```text
src/pages/apps/keyboard/testers/
├── tester-config.tsx                     # Route registration aggregator (/keyboard/testers)
├── testerList/
│   ├── tester-list-config.tsx            # Lazy loader + Suspense container
│   └── tester-list.tsx                   # Table view with search, sorting & badges
├── addEditTester/
│   └── tester-dialog.tsx                 # Modal Dialog for Add & Edit
└── delete-tester.tsx                     # Delete confirmation alert dialog
```

---

## 3. Task 1: Create Route Configurations

### `src/pages/apps/keyboard/testers/testerList/tester-list-config.tsx`

Following the project's Suspense-guarded lazy route architecture (from `campaign`):

```typescript
import React, { Suspense } from "react"
import Loader from "@/components/loader"

const TesterList = React.lazy(() => import("./tester-list"))

const TesterListContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <TesterList />
    </Suspense>
  )
}

const TesterListConfig = {
  path: "/keyboard/testers",
  element: <TesterListContainer />,
}

export default TesterListConfig
```

### `src/pages/apps/keyboard/testers/tester-config.tsx`

Clean route aggregator:

```typescript
import TesterListConfig from "./testerList/tester-list-config"

export const TesterConfig = {
  title: "Testers",
  ...TesterListConfig,
}

export default TesterConfig
```

---

## 4. Task 2: Create `addEditTester/tester-dialog.tsx`

**File:** `src/pages/apps/keyboard/testers/addEditTester/tester-dialog.tsx`

```typescript
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpsertTester } from "@/query/keyboard/useTester"
import {
  upsertTesterSchema,
  type UpsertTesterInputs,
  type Tester,
} from "@/utils/schemas/keyboard/testerSchema"

interface TesterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tester?: Tester | null
}

export const TesterDialog: React.FC<TesterDialogProps> = ({
  open,
  onOpenChange,
  tester,
}) => {
  const isEditing = !!tester
  const upsertTesterMutation = useUpsertTester()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpsertTesterInputs>({
    resolver: zodResolver(upsertTesterSchema),
    defaultValues: {
      deviceId: "",
      channel: "internal",
      name: "",
    },
  })

  useEffect(() => {
    if (tester) {
      reset({
        deviceId: tester.deviceId,
        channel: tester.channel,
        name: tester.name || "",
      })
    } else {
      reset({
        deviceId: "",
        channel: "internal",
        name: "",
      })
    }
  }, [tester, reset])

  const onSubmit = (data: UpsertTesterInputs) => {
    upsertTesterMutation.mutate(
      {
        deviceId: data.deviceId,
        body: {
          channel: data.channel,
          name: data.name,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          reset()
        },
      }
    )
  }

  const selectedChannel = watch("channel")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Tester Device" : "Enroll Tester Device"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Device ID */}
          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID *</Label>
            <Input
              id="deviceId"
              placeholder="e.g. pixel-7-qa-01"
              disabled={isEditing || upsertTesterMutation.isPending}
              {...register("deviceId")}
            />
            {errors.deviceId && (
              <p className="text-xs text-destructive">{errors.deviceId.message}</p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Device identifier is unique and cannot be changed.
              </p>
            )}
          </div>

          {/* Channel */}
          <div className="space-y-2">
            <Label htmlFor="channel">Target Channel *</Label>
            <Select
              value={selectedChannel}
              onValueChange={(val: "internal" | "beta") => setValue("channel", val)}
              disabled={upsertTesterMutation.isPending}
            >
              <SelectTrigger id="channel">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal (QA & Staff)</SelectItem>
                <SelectItem value="beta">Beta (Public Testers)</SelectItem>
              </SelectContent>
            </Select>
            {errors.channel && (
              <p className="text-xs text-destructive">{errors.channel.message}</p>
            )}
          </div>

          {/* Name / Label */}
          <div className="space-y-2">
            <Label htmlFor="name">Friendly Name / Owner</Label>
            <Input
              id="name"
              placeholder="e.g. QA Lab Pixel 7"
              disabled={upsertTesterMutation.isPending}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={upsertTesterMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upsertTesterMutation.isPending}>
              {upsertTesterMutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Enroll Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 5. Task 3: Create `delete-tester.tsx`

**File:** `src/pages/apps/keyboard/testers/delete-tester.tsx`

```typescript
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteTester } from "@/query/keyboard/useTester"
import type { Tester } from "@/utils/schemas/keyboard/testerSchema"

interface DeleteTesterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tester: Tester | null
}

export const DeleteTesterDialog: React.FC<DeleteTesterDialogProps> = ({
  open,
  onOpenChange,
  tester,
}) => {
  const deleteMutation = useDeleteTester()

  if (!tester) return null

  const handleDelete = () => {
    deleteMutation.mutate(
      { deviceId: tester.deviceId },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Tester Device</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove device <strong>{tester.deviceId}</strong>? It will immediately lose access to internal and beta channels and fall back to production.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Removing..." : "Remove Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 6. Task 4: Create `testerList/tester-list.tsx`

**File:** `src/pages/apps/keyboard/testers/testerList/tester-list.tsx`

Features:
- Search filter by device ID or name.
- Sortable table columns (`deviceId`, `channel`, `name`, `createdAt`) via `useTableSort`.
- 1-click copy device ID button with temporary checkmark icon.
- Badges: `internal` (indigo/purple), `beta` (amber).
- Responsive table with Loader and empty state placeholder.

---

## 7. Execution Checklist

- [x] 5.1 Create `tester-config.tsx` with lazy-loaded view.
- [x] 5.2 Create `tester-dialog.tsx` with react-hook-form + zod validation.
- [x] 5.3 Create `delete-tester.tsx` confirmation modal.
- [x] 5.4 Create `tester-list.tsx` with copyable device IDs, sortable columns, and channel pills.
