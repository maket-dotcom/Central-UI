import React from "react"
import { Flag, Sparkles, Zap, ShieldAlert } from "lucide-react"
import type { FeatureFlag } from "@/utils/schemas/keyboard/featureSchema"

interface FeatureStatsOverviewProps {
  features: FeatureFlag[]
  activeFilter?: string
  onSelectFilter?: (filter: string) => void
}

export const FeatureStatsOverview: React.FC<FeatureStatsOverviewProps> = ({
  features,
  activeFilter,
  onSelectFilter,
}) => {
  const total = features.length
  const activeCount = features.filter((f) => f.enabled).length
  const disabledCount = total - activeCount
  const canaryCount = features.filter(
    (f) => f.enabled && f.rolloutPercentage > 0 && f.rolloutPercentage < 100
  ).length
  const vipCount = features.filter(
    (f) => f.allowDevices && f.allowDevices.length > 0
  ).length
  const denyCount = features.filter(
    (f) => f.denyDevices && f.denyDevices.length > 0
  ).length

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {/* 1. Total Flags */}
      <div
        onClick={() => onSelectFilter?.("all")}
        className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
          activeFilter === "all" || !activeFilter
            ? "border-primary/40 bg-card shadow-xs ring-1 ring-primary/20"
            : "border-border bg-card/60 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Total Flags
          </span>
          <Flag className="size-4 text-primary" />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {total}
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {activeCount} on
            </span>
            <span>&bull;</span>
            <span>{disabledCount} off</span>
          </div>
        </div>
      </div>

      {/* 2. In-Flight Canaries */}
      <div
        onClick={() => onSelectFilter?.("canary")}
        className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
          activeFilter === "canary"
            ? "border-primary/40 bg-card shadow-xs ring-1 ring-primary/20"
            : "border-border bg-card/60 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            In-Flight Canaries
          </span>
          <Sparkles className="size-4 text-amber-500" />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {canaryCount}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            1%–99% Rollout
          </span>
        </div>
      </div>

      {/* 3. VIP Whitelist Overrides */}
      <div
        onClick={() => onSelectFilter?.("vip")}
        className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
          activeFilter === "vip"
            ? "border-primary/40 bg-card shadow-xs ring-1 ring-primary/20"
            : "border-border bg-card/60 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            VIP Bypasses
          </span>
          <Zap className="size-4 text-amber-500" />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {vipCount}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            allowDevices active
          </span>
        </div>
      </div>

      {/* 4. Emergency Blacklists */}
      <div
        onClick={() => onSelectFilter?.("deny")}
        className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
          activeFilter === "deny"
            ? "border-primary/40 bg-card shadow-xs ring-1 ring-primary/20"
            : "border-border bg-card/60 hover:bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Emergency Deny
          </span>
          <ShieldAlert className="size-4 text-rose-500" />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {denyCount}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            denyDevices active
          </span>
        </div>
      </div>
    </div>
  )
}

export default FeatureStatsOverview
