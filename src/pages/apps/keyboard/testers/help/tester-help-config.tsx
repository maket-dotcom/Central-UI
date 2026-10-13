import type { HelpDrawerConfig } from "@/components/helpTour/types"
import { Badge } from "@/components/ui/badge"
import { Radio, Layers, Zap, AlertTriangle } from "lucide-react"

export const testerHelpConfig: HelpDrawerConfig = {
  moduleName: "Tester Management",
  title: "Tester Management & Channel Registry Guide",
  subtitle:
    "Deterministic Device-to-Channel Mapping, Concentric Visibility, and VIP Allow Lists",
  versionTag: "Channel Registry v1.1",

  // 1. TOPICS (Guide & Architecture)
  topics: [
    {
      id: "channel-resolution-pipeline",
      title: "The Channel Resolution Pipeline",
      badge: "Core Architecture",
      icon: Radio,
      summary:
        "How device identifiers map deterministically to release channels",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            The <strong>Tester Registry</strong> links client hardware
            identifiers (
            <code className="font-mono text-primary">deviceId</code>) to release
            channels. Whenever a mobile client connects (via{" "}
            <code className="font-mono text-primary">
              /api/v1/client/bootstrap
            </code>{" "}
            or other endpoints), the server executes a 2-step lookup:
          </p>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Device Resolution Flow
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-2.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                  1
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Header Extraction (X-Device-Id)
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Identity
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    The client transmits its hardware or install UUID in the{" "}
                    <code className="font-mono">X-Device-Id</code> HTTP header.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-2.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                  2
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Tester Registry Database Query
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Resolution
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    • <strong>If deviceId is found:</strong> Client request is
                    assigned its registered channel (
                    <code className="font-mono text-purple-600 dark:text-purple-400">
                      internal
                    </code>{" "}
                    or{" "}
                    <code className="font-mono text-blue-600 dark:text-blue-400">
                      beta
                    </code>
                    ).
                    <br />• <strong>
                      If deviceId is NOT found or empty:
                    </strong>{" "}
                    Automatically and safely defaults to{" "}
                    <code className="font-mono text-emerald-600 dark:text-emerald-400">
                      production
                    </code>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <strong className="font-semibold text-primary">
              Zero-Configuration Public Users:
            </strong>
            <p className="text-muted-foreground">
              General users worldwide never need to be registered in the Tester
              collection. Unrecognized devices automatically operate on the safe{" "}
              <code className="font-mono">production</code> channel.
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "concentric-vs-strict-matching",
      title: "Concentric Releases vs. Strict Feature Matching",
      badge: "Targeting Rules",
      icon: Layers,
      summary:
        "How channel rings behave differently in Releases vs. Feature Flags",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            A critical rule governs how a device's channel is used by different
            subsystems:
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  App Releases: Concentric Rings
                </span>
                <Badge
                  variant="outline"
                  className="border-purple-500/40 text-[10px] text-purple-600"
                >
                  Inherited
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                In Release Management, channels inherit visibility downward:
                <br />• <strong>Internal Testers</strong> see Internal + Beta +
                Production builds.
                <br />• <strong>Beta Testers</strong> see Beta + Production
                builds.
                <br />• <strong>Production Users</strong> only see Production
                builds.
              </p>
            </div>

            <div className="space-y-1.5 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  Feature Flags: Strict Match
                </span>
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-[10px] text-blue-600"
                >
                  Strict
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                In Feature Flag evaluation, channels are evaluated strictly:
                <br />• If a feature flag targets{" "}
                <code className="font-mono">channels: ["internal"]</code>, a
                Beta tester will <strong>NOT</strong> receive it, even though
                they can see beta releases!
              </p>
            </div>
          </div>
        </div>
      ),
    },

    {
      id: "tester-channel-vs-vip-allowlist",
      title: "Tester Channel vs. Feature Flag VIP Allow List",
      badge: "VIP Override",
      icon: Zap,
      summary:
        "Why allowDevices completely overrides channel and rollout percentage",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-950 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>The VIP Pass Invariant:</span>
            </div>
            <p className="opacity-90">
              Setting a device's channel to{" "}
              <code className="font-mono">internal</code> or{" "}
              <code className="font-mono">beta</code> allows it to pass Gate 5
              for flags targeted to those rings.
              <br />
              However, adding a device ID directly to a feature flag's{" "}
              <strong>allowDevices</strong> list acts as a{" "}
              <strong>VIP Pass (Gate 2)</strong>:
              <br />
              • It completely bypasses OS platform checks.
              <br />
              • It completely bypasses channel checks.
              <br />• It completely bypasses the rollout percentage (even at 0%
              rollout!).
            </p>
          </div>
        </div>
      ),
    },
  ],

  // 2. PLAYBOOKS (Operational Recipes)
  playbooks: [
    {
      id: "enroll-qa-alpha-phone",
      title: "Enrolling a QA Lab Phone for Alpha Testing",
      category: "Onboarding",
      badge: "Internal Ring",
      goal: "Enroll an in-house testbed device to test bleeding-edge alpha builds and internal feature flags.",
      configurationSummary:
        "deviceId: 'dd95dfecd2ce8005' | channel: 'internal' | name: 'QA Pixel 7 Testbed'",
      whyItWorks:
        "The server immediately assigns channel: 'internal' whenever this deviceId appears in requests, enabling internal feature flags and alpha builds on the next bootstrap.",
    },

    {
      id: "promote-to-beta",
      title: "Promoting a Device to Beta Testing",
      category: "Ring Promotion",
      badge: "Beta Ring",
      goal: "Verify the exact user experience and configurations that external beta testers will encounter.",
      configurationSummary: "Update channel to 'beta'",
      whyItWorks:
        "The device transitions out of the internal channel. It will no longer receive internal-only flags, accurately mirroring the external beta audience.",
    },

    {
      id: "decommission-device",
      title: "Offboarding a Lost or Retired Device",
      category: "Cleanup",
      badge: "Deletion",
      goal: "A testbed device is retired, sold, or returned. Remove all privileged access.",
      configurationSummary: "Delete tester record from the Tester table",
      whyItWorks:
        "Once deleted, any subsequent requests from that hardware identifier will seamlessly fall back to safe production defaults.",
    },

    {
      id: "diagnose-unexpected-feature",
      title: "Diagnosing Why a Device Received a Feature",
      category: "Troubleshooting",
      badge: "Diagnostics",
      goal: "A tester reports seeing an unexpected feature. Track down why it was enabled.",
      configurationSummary:
        "1. Check Tester channel → 2. Check Feature Flag allowDevices → 3. Check Rollout %",
      whyItWorks:
        "If the device is in allowDevices, it bypassed all gates. If it's enrolled in 'internal', it matched the channel gate.",
    },
  ],

  // 3. TROUBLESHOOTING MATRIX
  troubleshooting: [
    {
      problem: "Tester device is not receiving internal feature flags",
      cause: "Device ID typo or case-sensitivity mismatch",
      solution:
        "Verify exact X-Device-Id sent by the client. Whitespace and character case must match the database record.",
      tag: "Device ID Match",
    },
    {
      problem: "Device assigned to Beta cannot see Internal release",
      cause: "Concentric rings do not grant upward visibility",
      solution:
        "Beta testers cannot see internal releases. Reassign the device to the 'internal' channel.",
      tag: "Ring Hierarchy",
    },
    {
      problem: "Unregistered device receives a Beta feature",
      cause: "Device ID is listed in the feature flag's allowDevices VIP list",
      solution:
        "Inspect the feature flag configuration. allowDevices overrides channel registration.",
      tag: "VIP Allow List",
    },
    {
      problem: "Cannot enroll tester: 'Device ID is required'",
      cause: "Empty or whitespace-only device identifier",
      solution: "Provide a valid non-empty hardware UUID string.",
      tag: "Validation",
    },
    {
      problem: "Tester sees stale configurations after channel switch",
      cause: "HTTP 304 Caching on mobile client",
      solution:
        "The mobile app cached previous bootstrap response. Restart app or clear cache to fetch new channel data.",
      tag: "Client Cache",
    },
  ],

  // 4. QUICK REFERENCE TABLE
  quickReferenceTable: {
    headers: [
      "Field Name",
      "Type",
      "Required?",
      "Default",
      "Operational Impact",
    ],
    rows: [
      [
        "deviceId",
        "string",
        "YES",
        "-",
        "Hardware UUID (e.g. 'dd95dfecd2ce8005'). Primary unique lookup key.",
      ],
      [
        "channel",
        "enum (internal | beta | production)",
        "YES",
        "-",
        "Release channel ring. Governs feature flags and app releases.",
      ],
      [
        "name",
        "string",
        "No",
        "''",
        "Human-friendly label (e.g. 'Sarthak Pixel 7', 'QA Automation Lab #2').",
      ],
      [
        "createdAt",
        "datetime",
        "Auto",
        "-",
        "Timestamp when device was first enrolled in the registry.",
      ],
      [
        "updatedAt",
        "datetime",
        "Auto",
        "-",
        "Timestamp when channel or name was last modified.",
      ],
    ],
  },

  // 5. STEP-BY-STEP WALKTHROUGH TOUR
  tourSteps: [
    {
      id: "step-1-device-identifier",
      title: "1. Device Hardware Identifier (deviceId)",
      subtitle: "The unique key identifying the client",
      badge: "Identity",
      description:
        "Enter the hardware UUID or installation identifier reported by the client (such as Android ID or iOS vendor identifier). This string uniquely maps incoming HTTP requests to their tester profile.",
      callout: {
        type: "tip",
        title: "Exact Matching",
        text: "Device IDs are compared exactly. Ensure no leading or trailing whitespace is copied from device logs.",
      },
    },
    {
      id: "step-2-channel-ring",
      title: "2. Selecting Release Channel (Ring)",
      subtitle: "Assigning privilege and visibility level",
      badge: "Privilege",
      description:
        "Assign the device to either 'internal' (for core engineering and daily QA builds) or 'beta' (for early adopters and release candidate verification).",
    },
    {
      id: "step-3-friendly-name",
      title: "3. Friendly Device & Owner Name",
      subtitle: "Inventory tracking and clarity",
      badge: "Metadata",
      description:
        "Add a descriptive name like 'QA Lab Samsung S23' or 'Design Lead iPhone 15' to easily identify hardware assets in the management table.",
    },
  ],
}
