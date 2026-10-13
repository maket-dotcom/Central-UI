import React, { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import {
  Plus,
  X,
  AlertTriangle,
  Zap,
  ShieldAlert,
  ClipboardPaste,
} from "lucide-react"

interface FeatureDeviceTagInputProps {
  id: string
  label: string
  subtitle?: string
  devices: string[]
  onChange: (devices: string[]) => void
  conflictingDevices?: string[] // e.g. if this is allow list, pass denyDevices here
  variant?: "allow" | "deny"
  maxDevices?: number
}

export const FeatureDeviceTagInput: React.FC<FeatureDeviceTagInputProps> = ({
  id,
  label,
  subtitle,
  devices,
  onChange,
  conflictingDevices = [],
  variant = "allow",
  maxDevices = 50,
}) => {
  const [inputValue, setInputValue] = useState("")
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState("")

  const isAtLimit = devices.length >= maxDevices
  const remaining = maxDevices - devices.length

  const handleAddDevice = (valToAdd?: string) => {
    const raw = (valToAdd !== undefined ? valToAdd : inputValue).trim()
    if (!raw) return
    if (devices.includes(raw)) {
      setInputValue("")
      return
    }
    if (isAtLimit) return

    onChange([...devices, raw])
    setInputValue("")
  }

  const handleRemoveDevice = (devToRemove: string) => {
    onChange(devices.filter((d) => d !== devToRemove))
  }

  const handleApplyBulk = () => {
    if (!bulkText.trim()) return
    // Split by comma, newline, carriage return, space or tab
    const tokens = bulkText
      .split(/[\r\n,\s\t]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)

    const existingSet = new Set(devices)
    const newItems: string[] = []

    for (const token of tokens) {
      if (!existingSet.has(token) && !newItems.includes(token)) {
        if (devices.length + newItems.length < maxDevices) {
          newItems.push(token)
        }
      }
    }

    onChange([...devices, ...newItems])
    setBulkText("")
    setBulkMode(false)
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor={id}
              className="text-xs font-semibold text-foreground"
            >
              {label}
            </Label>
            {variant === "allow" ? (
              <Badge
                variant="outline"
                className="gap-1 border-amber-500/30 font-mono text-[10px] text-amber-600 dark:text-amber-400"
              >
                <Zap className="size-3" />
                VIP Bypass (Gate 3)
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-rose-500/30 font-mono text-[10px] text-rose-600 dark:text-rose-400"
              >
                <ShieldAlert className="size-3" />
                Emergency Blacklist (Gate 2)
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {/* Counter Badge */}
        <Badge
          variant={
            isAtLimit ? "destructive" : remaining <= 5 ? "secondary" : "outline"
          }
          className="font-mono text-[11px]"
        >
          {devices.length} / {maxDevices} devices
        </Badge>
      </div>

      {/* Input or Bulk Mode */}
      {!bulkMode ? (
        <div className="flex items-center gap-2">
          <InputGroup className="flex-1">
            <InputGroupInput
              id={id}
              placeholder={
                isAtLimit
                  ? "Maximum 50 devices ceiling reached"
                  : "Enter device UUID (e.g. dd95dfecd2ce8005) and press Add..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isAtLimit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddDevice()
                }
              }}
              className="font-mono text-xs"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => handleAddDevice()}
                disabled={isAtLimit || !inputValue.trim()}
                className="cursor-pointer gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                Add
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setBulkMode(true)}
            disabled={isAtLimit}
            title="Paste multiple device IDs at once"
            className="h-9 shrink-0 cursor-pointer gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ClipboardPaste className="size-3.5" />
            Bulk Paste
          </Button>
        </div>
      ) : (
        <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">
              Bulk Import Device IDs (Comma or Newline Separated)
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBulkMode(false)}
              className="h-6 px-2 text-xs"
            >
              Cancel
            </Button>
          </div>
          <Textarea
            rows={3}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste list of device IDs here:&#10;dd95dfecd2ce8005&#10;sarthak_dev_pixel&#10;qa_s24_ultra"
            className="w-full bg-background font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleApplyBulk}
              disabled={!bulkText.trim()}
              className="cursor-pointer text-xs font-semibold"
            >
              Import Devices
            </Button>
          </div>
        </div>
      )}

      {/* Render Tags */}
      {devices.length > 0 && (
        <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto pt-1">
          {devices.map((dev) => {
            const hasConflict = conflictingDevices.includes(dev)

            return (
              <Badge
                key={dev}
                variant={
                  hasConflict
                    ? "destructive"
                    : variant === "allow"
                      ? "secondary"
                      : "destructive"
                }
                className={`gap-1 font-mono text-xs ${
                  hasConflict ? "animate-pulse ring-2 ring-rose-500" : ""
                }`}
                title={
                  hasConflict
                    ? "Warning: Device exists in both Allow and Deny lists!"
                    : undefined
                }
              >
                {hasConflict && (
                  <AlertTriangle className="size-3 text-rose-300" />
                )}
                <span>{dev}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDevice(dev)}
                  className="cursor-pointer hover:opacity-75"
                  aria-label={`Remove ${dev}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FeatureDeviceTagInput
