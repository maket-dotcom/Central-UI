import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Play, CheckCircle2, XCircle } from "lucide-react"
import SelectComponent from "@/components/inputComponents/select-component"
import type {
  FeaturePlatform,
  FeatureChannel,
} from "@/utils/schemas/keyboard/featureSchema"

// FNV-1a deterministic hash implementation matching iKeyboard-backend/src/utils/targeting/rollout.ts
export function calculateFnv1aBucket(salt: string, deviceId: string): number {
  if (!deviceId) return 0
  const fnvPrime = 0x01000193
  let hash = 0x811c9dc5
  const str = `${salt}:${deviceId}`
  const bytes = new TextEncoder().encode(str)
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i]
    hash = Math.imul(hash, fnvPrime)
  }
  return (hash >>> 0) % 100
}

export interface FlagSimulationConfig {
  key: string
  enabled: boolean
  platforms?: FeaturePlatform[]
  channels?: FeatureChannel[]
  minBuildNumber?: { android?: number; ios?: number }
  maxBuildNumber?: { android?: number; ios?: number }
  rolloutPercentage: number
  allowDevices?: string[]
  denyDevices?: string[]
  payload?: Record<string, unknown>
}

interface FeatureSimulatorCardProps {
  flagConfig: FlagSimulationConfig
  className?: string
  compact?: boolean
}

export interface GateTraceStep {
  gateNumber: number
  name: string
  status: "passed" | "failed" | "fast_track" | "skipped"
  reason: string
}

export const FeatureSimulatorCard: React.FC<FeatureSimulatorCardProps> = ({
  flagConfig,
  className = "",
}) => {
  // Test device inputs
  const [testDeviceId, setTestDeviceId] = useState("sarthak_xiaomi_dev")
  const [testPlatform, setTestPlatform] = useState<FeaturePlatform>("android")
  const [testChannel, setTestChannel] = useState<FeatureChannel>("beta")
  const [testBuildNumber, setTestBuildNumber] = useState<number>(2)

  // Simulation output state
  const [hasEvaluated, setHasEvaluated] = useState(false)
  const [evalResult, setEvalResult] = useState<{
    enabled: boolean
    trace: GateTraceStep[]
    bucketValue: number
    shortCircuitGate?: number
  } | null>(null)

  const runSimulation = () => {
    const trace: GateTraceStep[] = []
    const cleanDeviceId = testDeviceId.trim()
    const bucket = calculateFnv1aBucket(
      flagConfig.key || "test_key",
      cleanDeviceId
    )

    // GATE 1: Master switch
    if (!flagConfig.enabled) {
      trace.push({
        gateNumber: 1,
        name: "Master Kill-Switch (enabled)",
        status: "failed",
        reason: "Master Switch is OFF. Feature is globally disabled worldwide.",
      })
      setEvalResult({
        enabled: false,
        trace,
        bucketValue: bucket,
        shortCircuitGate: 1,
      })
      setHasEvaluated(true)
      return
    }
    trace.push({
      gateNumber: 1,
      name: "Master Kill-Switch (enabled)",
      status: "passed",
      reason: "Master Switch is ON (enabled: true).",
    })

    // GATE 2: Deny List (denyDevices)
    if (
      cleanDeviceId &&
      flagConfig.denyDevices &&
      flagConfig.denyDevices.includes(cleanDeviceId)
    ) {
      trace.push({
        gateNumber: 2,
        name: "Deny List (denyDevices)",
        status: "failed",
        reason: `Device "${cleanDeviceId}" is in emergency Deny List. Force OFF!`,
      })
      setEvalResult({
        enabled: false,
        trace,
        bucketValue: bucket,
        shortCircuitGate: 2,
      })
      setHasEvaluated(true)
      return
    }
    trace.push({
      gateNumber: 2,
      name: "Deny List (denyDevices)",
      status: "passed",
      reason: "Device is not in Deny List.",
    })

    // GATE 3: Allow List (allowDevices - VIP Fast-Track)
    if (
      cleanDeviceId &&
      flagConfig.allowDevices &&
      flagConfig.allowDevices.includes(cleanDeviceId)
    ) {
      trace.push({
        gateNumber: 3,
        name: "Allow List (allowDevices)",
        status: "fast_track",
        reason: `Device "${cleanDeviceId}" is in VIP Allow List! Bypasses Platform, Channel, Build, and Rollout gates.`,
      })
      // Skipped gates
      trace.push({
        gateNumber: 4,
        name: "Platform Gate",
        status: "skipped",
        reason: "Bypassed by Gate 3 VIP Allow List.",
      })
      trace.push({
        gateNumber: 5,
        name: "Channel Gate",
        status: "skipped",
        reason: `Bypassed by Gate 3 VIP Allow List (Channel "${testChannel}" vs "${flagConfig.channels?.join(", ") || "all"}" ignored).`,
      })
      trace.push({
        gateNumber: 6,
        name: "Build Threshold Bounds",
        status: "skipped",
        reason: "Bypassed by Gate 3 VIP Allow List.",
      })
      trace.push({
        gateNumber: 7,
        name: "Rollout Percentage Hash Bucket",
        status: "skipped",
        reason: `Bypassed by Gate 3 VIP Allow List (Rollout ${flagConfig.rolloutPercentage}% ignored).`,
      })

      setEvalResult({
        enabled: true,
        trace,
        bucketValue: bucket,
        shortCircuitGate: 3,
      })
      setHasEvaluated(true)
      return
    }
    trace.push({
      gateNumber: 3,
      name: "Allow List (allowDevices)",
      status: "passed",
      reason:
        "Device is not in VIP Allow List. Proceeding to standard targeting gates.",
    })

    // GATE 4: Platform restriction
    if (
      flagConfig.platforms &&
      flagConfig.platforms.length > 0 &&
      !flagConfig.platforms.includes(testPlatform)
    ) {
      trace.push({
        gateNumber: 4,
        name: "Platform Gate",
        status: "failed",
        reason: `Platform mismatch: Device is "${testPlatform}", but flag only allows [${flagConfig.platforms.join(", ")}].`,
      })
      setEvalResult({
        enabled: false,
        trace,
        bucketValue: bucket,
        shortCircuitGate: 4,
      })
      setHasEvaluated(true)
      return
    }
    trace.push({
      gateNumber: 4,
      name: "Platform Gate",
      status: "passed",
      reason: `Platform "${testPlatform}" matches allowed platforms [${flagConfig.platforms?.join(", ") || "all"}].`,
    })

    // GATE 5: Channel restriction
    if (
      flagConfig.channels &&
      flagConfig.channels.length > 0 &&
      !flagConfig.channels.includes(testChannel)
    ) {
      trace.push({
        gateNumber: 5,
        name: "Channel Gate",
        status: "failed",
        reason: `Channel mismatch: Device is "${testChannel}", but flag only allows [${flagConfig.channels.join(", ")}].`,
      })
      setEvalResult({
        enabled: false,
        trace,
        bucketValue: bucket,
        shortCircuitGate: 5,
      })
      setHasEvaluated(true)
      return
    }
    trace.push({
      gateNumber: 5,
      name: "Channel Gate",
      status: "passed",
      reason: `Channel "${testChannel}" matches allowed channels [${flagConfig.channels?.join(", ") || "all"}].`,
    })

    // GATE 6: Build number bounds
    const minBuild = flagConfig.minBuildNumber?.[testPlatform]
    const maxBuild = flagConfig.maxBuildNumber?.[testPlatform]

    if (minBuild !== undefined && testBuildNumber < minBuild) {
      trace.push({
        gateNumber: 6,
        name: "Build Threshold Bounds",
        status: "failed",
        reason: `Build too low: Device build ${testBuildNumber} < Min Build ${minBuild} for ${testPlatform}.`,
      })
      setEvalResult({
        enabled: false,
        trace,
        bucketValue: bucket,
        shortCircuitGate: 6,
      })
      setHasEvaluated(true)
      return
    }

    if (maxBuild !== undefined && testBuildNumber > maxBuild) {
      trace.push({
        gateNumber: 6,
        name: "Build Threshold Bounds",
        status: "failed",
        reason: `Build too high: Device build ${testBuildNumber} > Max Build ${maxBuild} for ${testPlatform}.`,
      })
      setEvalResult({
        enabled: false,
        trace,
        bucketValue: bucket,
        shortCircuitGate: 6,
      })
      setHasEvaluated(true)
      return
    }
    trace.push({
      gateNumber: 6,
      name: "Build Threshold Bounds",
      status: "passed",
      reason: `Build number ${testBuildNumber} satisfies version bounds for ${testPlatform}.`,
    })

    // GATE 7: Rollout percentage (FNV-1a hash bucket < rolloutPercentage)
    if (flagConfig.rolloutPercentage >= 100) {
      trace.push({
        gateNumber: 7,
        name: "Rollout Percentage Hash Bucket",
        status: "passed",
        reason: `Rollout is 100% General Availability (Bucket ${bucket}% < 100%).`,
      })
      setEvalResult({ enabled: true, trace, bucketValue: bucket })
      setHasEvaluated(true)
      return
    }

    if (flagConfig.rolloutPercentage <= 0) {
      trace.push({
        gateNumber: 7,
        name: "Rollout Percentage Hash Bucket",
        status: "failed",
        reason: `Rollout is 0%. Device not in VIP list, so it receives enabled: false.`,
      })
      setEvalResult({
        enabled: false,
        trace,
        bucketValue: bucket,
        shortCircuitGate: 7,
      })
      setHasEvaluated(true)
      return
    }

    const inBucket = bucket < flagConfig.rolloutPercentage
    if (inBucket) {
      trace.push({
        gateNumber: 7,
        name: "Rollout Percentage Hash Bucket",
        status: "passed",
        reason: `Calculated FNV-1a Hash Bucket is ${bucket}%, which is < Rollout ${flagConfig.rolloutPercentage}%.`,
      })
      setEvalResult({ enabled: true, trace, bucketValue: bucket })
      setHasEvaluated(true)
    } else {
      trace.push({
        gateNumber: 7,
        name: "Rollout Percentage Hash Bucket",
        status: "failed",
        reason: `Device FNV-1a Hash Bucket is ${bucket}%, which is >= Rollout ${flagConfig.rolloutPercentage}%. Needs >= ${bucket + 1}% rollout.`,
      })
      setEvalResult({
        enabled: false,
        trace,
        bucketValue: bucket,
        shortCircuitGate: 7,
      })
      setHasEvaluated(true)
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-card shadow-xs ${className}`}
    >
      {/* Simulator Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              7-Gate Device Evaluator & Rule Debugger
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Test any device context against flag:{" "}
              <strong className="font-mono text-foreground">
                {flagConfig.key || "(unnamed)"}
              </strong>
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={runSimulation}
          className="shrink-0 cursor-pointer gap-1.5 text-xs font-semibold"
        >
          <Play className="size-3 fill-current" />
          <span>Simulate Now</span>
        </Button>
      </div>

      {/* Simulator Inputs Grid */}
      <div className="border-b border-border/60 bg-muted/10 p-4">
        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 md:grid-cols-4">
          {/* Device ID */}
          <div className="space-y-1">
            <Label className="text-[11px]">Device ID (X-Device-Id)</Label>
            <Input
              value={testDeviceId}
              onChange={(e) => setTestDeviceId(e.target.value)}
              placeholder="e.g. sarthak_dev_pixel"
              className="h-8 font-mono text-xs"
            />
          </div>

          {/* Platform */}
          <div className="space-y-1">
            <Label className="text-[11px]">Platform (X-Platform)</Label>
            <SelectComponent
              value={testPlatform}
              onValueChange={(val) =>
                setTestPlatform((val as FeaturePlatform) || "android")
              }
              placeholder="Platform"
              title="Platform"
              data={[
                { name: "Android", value: "android" },
                { name: "iOS", value: "ios" },
              ]}
            />
          </div>

          {/* Channel */}
          <div className="space-y-1">
            <Label className="text-[11px]">Channel (X-Channel)</Label>
            <SelectComponent
              value={testChannel}
              onValueChange={(val) =>
                setTestChannel((val as FeatureChannel) || "beta")
              }
              placeholder="Channel"
              title="Channel"
              data={[
                { name: "Internal (QA)", value: "internal" },
                { name: "Beta", value: "beta" },
                { name: "Production", value: "production" },
              ]}
            />
          </div>

          {/* Build Number */}
          <div className="space-y-1">
            <Label className="text-[11px]">Build Number (X-Build-Number)</Label>
            <Input
              type="number"
              value={testBuildNumber}
              onChange={(e) => setTestBuildNumber(Number(e.target.value))}
              placeholder="e.g. 2"
              className="h-8 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Simulation Trace Output */}
      {hasEvaluated && evalResult && (
        <div className="space-y-4 p-4">
          {/* Result Banner */}
          <div
            className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 ${
              evalResult.enabled
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
                : "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {evalResult.enabled ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span>
                    Outcome:{" "}
                    {evalResult.enabled
                      ? "ENABLED for this Device"
                      : "DISABLED (Omitted / False)"}
                  </span>
                  <Badge
                    variant={evalResult.enabled ? "default" : "destructive"}
                    className="font-mono text-[10px]"
                  >
                    {evalResult.enabled
                      ? '{ "enabled": true }'
                      : '{ "enabled": false }'}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs opacity-90">
                  {evalResult.enabled
                    ? "Device satisfies all targeted criteria or matched the VIP Allow List bypass."
                    : `Evaluation stopped at Gate ${evalResult.shortCircuitGate}. Flag is delivered as enabled: false.`}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="block font-mono text-[11px] opacity-80">
                FNV-1a Hash Bucket:
              </span>
              <Badge
                variant="outline"
                className="mt-0.5 font-mono text-xs font-bold"
              >
                {evalResult.bucketValue}%
              </Badge>
            </div>
          </div>

          {/* Gate-by-Gate Step List */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Sequential 7-Gate Pipeline Trace
            </div>

            <div className="space-y-1.5 font-sans">
              {evalResult.trace.map((step) => {
                const isPassed = step.status === "passed"
                const isFastTrack = step.status === "fast_track"
                const isFailed = step.status === "failed"
                const isSkipped = step.status === "skipped"

                return (
                  <div
                    key={step.gateNumber}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-2.5 text-xs transition-colors ${
                      isFastTrack
                        ? "border-primary/40 bg-primary/10 font-medium text-primary"
                        : isFailed
                          ? "border-rose-500/30 bg-rose-500/5 text-rose-950 dark:text-rose-200"
                          : isSkipped
                            ? "border-border/40 bg-muted/20 text-muted-foreground opacity-60"
                            : "border-emerald-500/20 bg-emerald-500/5 text-foreground"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 font-mono text-[11px] font-bold opacity-70">
                        Gate {step.gateNumber}:
                      </span>
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span>{step.name}</span>
                          {isFastTrack && (
                            <Badge
                              variant="default"
                              className="px-1 py-0 text-[9px] uppercase"
                            >
                              VIP Fast-Track
                            </Badge>
                          )}
                          {isSkipped && (
                            <Badge
                              variant="secondary"
                              className="px-1 py-0 text-[9px]"
                            >
                              Bypassed
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed opacity-80">
                          {step.reason}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 font-mono text-[11px]">
                      {isPassed && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          PASS &#10003;
                        </span>
                      )}
                      {isFastTrack && (
                        <span className="font-bold text-primary">
                          BYPASS &#9889;
                        </span>
                      )}
                      {isFailed && (
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          FAIL &#10007;
                        </span>
                      )}
                      {isSkipped && (
                        <span className="text-muted-foreground">SKIPPED</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeatureSimulatorCard
