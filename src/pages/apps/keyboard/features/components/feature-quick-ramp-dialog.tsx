import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react"
import { useUpdateFeature } from "@/query/keyboard/useFeature"
import type { FeatureFlag } from "@/utils/schemas/keyboard/featureSchema"

interface FeatureQuickRampDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: FeatureFlag | null
  onSuccess?: () => void
}

export const FeatureQuickRampDialog: React.FC<FeatureQuickRampDialogProps> = ({
  open,
  onOpenChange,
  feature,
  onSuccess,
}) => {
  const updateMutation = useUpdateFeature()
  const [targetPercentage, setTargetPercentage] = useState<number>(
    feature?.rolloutPercentage ?? 100
  )
  const [prevFeatureKey, setPrevFeatureKey] = useState<string | null>(
    feature?.key ?? null
  )

  if (feature && feature.key !== prevFeatureKey) {
    setPrevFeatureKey(feature.key)
    setTargetPercentage(feature.rolloutPercentage)
  }

  if (!feature) return null

  const current = feature.rolloutPercentage
  const isDialingDown = targetPercentage < current
  const isUnchanged = targetPercentage === current

  const STAGES = [
    { label: "Canary (10%)", value: 10 },
    { label: "Early (25%)", value: 25 },
    { label: "Majority (50%)", value: 50 },
    { label: "GA (100%)", value: 100 },
  ]

  const handleSave = () => {
    updateMutation.mutate(
      {
        key: feature.key,
        body: { rolloutPercentage: targetPercentage },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Advance Canary Rollout
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Adjust gradual release percentage for flag{" "}
            <strong className="font-mono text-foreground">{feature.key}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Current vs Target Badge */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
            <div>
              <span className="block text-[11px] text-muted-foreground">
                Current Rollout
              </span>
              <span className="font-mono text-sm font-bold text-foreground">
                {current}%
              </span>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
            <div className="text-right">
              <span className="block text-[11px] text-muted-foreground">
                New Target
              </span>
              <span className="font-mono text-sm font-bold text-primary">
                {targetPercentage}%
              </span>
            </div>
          </div>

          {/* Preset ToggleGroup */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Quick-Select Standard Canary Stages:
            </span>
            <ToggleGroup
              value={[String(targetPercentage)]}
              onValueChange={(val) => {
                if (val && val.length > 0) {
                  setTargetPercentage(Number(val[val.length - 1]))
                }
              }}
              variant="outline"
              size="sm"
              className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {STAGES.map((st) => (
                <ToggleGroupItem
                  key={st.value}
                  value={String(st.value)}
                  className="w-full cursor-pointer text-xs font-medium"
                >
                  {st.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Slider & Input */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-4">
              <Slider
                value={targetPercentage}
                onValueChange={(val) => {
                  const num = Array.isArray(val) ? val[0] : val
                  setTargetPercentage(num)
                }}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={targetPercentage}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  if (!isNaN(val)) {
                    setTargetPercentage(Math.min(100, Math.max(0, val)))
                  }
                }}
                className="w-16 text-center font-mono text-xs"
              />
            </div>
          </div>

          {/* Warning on dialed down */}
          {isDialingDown && (
            <Alert
              variant="destructive"
              className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200"
            >
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="font-bold">
                Caution: Dialing Backwards
              </AlertTitle>
              <AlertDescription className="text-[11px] text-amber-950/90 dark:text-amber-200/90">
                Reducing rollout from {current}% to {targetPercentage}% will
                immediately deactivate this feature for active users bucketed in
                buckets {targetPercentage}–{current}%. Only do this for
                emergency rollbacks.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending || isUnchanged}
            className="text-xs font-semibold"
          >
            {updateMutation.isPending ? "Updating..." : "Apply Rollout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FeatureQuickRampDialog
