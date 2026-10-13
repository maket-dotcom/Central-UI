import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Sliders,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react"

interface FeatureGateVisualizerProps {
  className?: string
  activeGateIndex?: number // 1 to 7
  highlightVipBypass?: boolean
}

export const FeatureGateVisualizer: React.FC<FeatureGateVisualizerProps> = ({
  className = "",
  activeGateIndex,
  highlightVipBypass = true,
}) => {
  const gates = [
    {
      gateNumber: 1,
      name: "Master Switch",
      field: "enabled",
      icon: ShieldCheck,
      description:
        "If false, the feature is dead for 100% of devices worldwide.",
      failOutcome: '❌ { "enabled": false } (Global OFF)',
    },
    {
      gateNumber: 2,
      name: "Deny List",
      field: "denyDevices",
      icon: ShieldAlert,
      description:
        "Emergency blacklist. Overrules 100% rollout and explicit VIP Allow lists.",
      failOutcome: '❌ { "enabled": false } (Emergency Blacklist)',
    },
    {
      gateNumber: 3,
      name: "Allow List (VIP Fast-Track)",
      field: "allowDevices",
      icon: Zap,
      description:
        "VIP whitelist (max 50). Forces true, bypassing Platform, Channel, Build & Rollout!",
      passOutcome:
        '⚡ Fast-Track EXIT ➔ { "enabled": true } (Bypasses Gates 4–7)',
      isVip: true,
    },
    {
      gateNumber: 4,
      name: "Platform Gate",
      field: "platforms",
      icon: Smartphone,
      description: "Restricted OS: android, ios, or empty for all platforms.",
      failOutcome: '❌ { "enabled": false } (Platform Mismatch)',
    },
    {
      gateNumber: 5,
      name: "Channel Gate",
      field: "channels",
      icon: Sliders,
      description: "Restricted rings: internal, beta, production. Empty = all.",
      failOutcome: '❌ { "enabled": false } (Channel Mismatch)',
    },
    {
      gateNumber: 6,
      name: "Build Threshold Bounds",
      field: "minBuildNumber / maxBuildNumber",
      icon: Layers,
      description: "App native build range per platform (e.g. android >= 45).",
      failOutcome: '❌ { "enabled": false } (Build Out-of-Bounds)',
    },
    {
      gateNumber: 7,
      name: "Deterministic Rollout Bucket",
      field: "rolloutPercentage",
      icon: Sparkles,
      description:
        "Stable FNV-1a hash (bucket < percentage). Monotonicity guaranteed.",
      passOutcome: '✅ { "enabled": true, "payload": ... }',
      failOutcome: '❌ { "enabled": false } (Hash >= Rollout %)',
    },
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-foreground">
          The 7-Gate Sequential Evaluation Pipeline
        </div>
        <Badge variant="outline" className="font-mono text-[10px]">
          Priority 1 ➔ 7
        </Badge>
      </div>

      <div className="space-y-2">
        {gates.map((g) => {
          const Icon = g.icon
          const isVip = g.isVip
          const isSelected = activeGateIndex === g.gateNumber

          return (
            <div
              key={g.gateNumber}
              className={`relative rounded-xl border p-3 transition-all ${
                isVip && highlightVipBypass
                  ? "border-amber-500/40 bg-amber-500/5 shadow-xs"
                  : isSelected
                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-border/80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
                      isVip
                        ? "bg-amber-500 font-extrabold text-amber-950"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {g.gateNumber}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <Icon className="size-3.5 text-muted-foreground" />
                        {g.name}
                      </span>
                      <code className="font-mono text-[10px] text-muted-foreground">
                        ({g.field})
                      </code>
                      {isVip && (
                        <Badge
                          variant="default"
                          className="bg-amber-500 px-1 py-0 text-[9px] font-bold text-amber-950 uppercase hover:bg-amber-600"
                        >
                          VIP Bypass
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {g.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right font-mono text-[10px]">
                  {g.isVip ? (
                    <span className="block font-bold text-amber-600 dark:text-amber-400">
                      ⚡ FAST-TRACK EXIT
                    </span>
                  ) : g.gateNumber === 7 ? (
                    <span className="block font-bold text-emerald-600 dark:text-emerald-400">
                      ✅ SUCCESS EXIT
                    </span>
                  ) : (
                    <span className="block text-rose-600 dark:text-rose-400">
                      Omit on Mismatch
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FeatureGateVisualizer
