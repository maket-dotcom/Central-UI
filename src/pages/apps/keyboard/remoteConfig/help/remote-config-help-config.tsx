import type { HelpDrawerConfig } from "@/components/helpTour/types"
import { Badge } from "@/components/ui/badge"
import {
  GitMerge,
  History,
  AlertTriangle,
  RotateCcw,
  Split,
} from "lucide-react"

export const remoteConfigHelpConfig: HelpDrawerConfig = {
  moduleName: "Remote Config",
  title: "Remote Configuration Operations Guide",
  subtitle:
    "3-Tier Deep Merge Engine, Optimistic Concurrency Control, and 1-Click Rollback",
  versionTag: "Remote Config v1.4",

  // 1. TOPICS (Guide & Architecture)
  topics: [
    {
      id: "three-tier-deep-merge",
      title: "The 3-Tier Deep-Merge Engine",
      badge: "Core Architecture",
      icon: GitMerge,
      summary:
        "How platform defaults (all) merge with OS-specific overrides (android / ios)",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            Remote Configuration organizes application settings into isolated{" "}
            <strong>Namespaces</strong> (e.g.,{" "}
            <code className="font-mono text-primary">keyboard_settings</code>,{" "}
            <code className="font-mono text-primary">haptic_feedback</code>).
            Within each namespace, configurations follow a 3-tier resolution
            engine:
          </p>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Platform Hierarchy & Merge Pipeline
            </div>

            <div className="space-y-2">
              {[
                {
                  tier: "Tier 1",
                  title: "Global Baseline Foundation ('all')",
                  desc: "Platform 'all' establishes baseline keys for every mobile device worldwide regardless of operating system.",
                  badge: "Rank 0",
                },
                {
                  tier: "Tier 2",
                  title: "Platform-Specific Overrides ('android' / 'ios')",
                  desc: "Matches client OS and deep-merges on top of Tier 1. Keys defined here overwrite or extend baseline settings.",
                  badge: "Rank 1",
                },
                {
                  tier: "Tier 3",
                  title: "Client Flattening & ETag Delivery",
                  desc: "Extracts all namespace dictionaries into a single root key-value map for fast, zero-traversal mobile lookups.",
                  badge: "Output",
                },
              ].map((t, idx) => (
                <div
                  key={t.tier}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-2.5 transition-colors hover:bg-muted/60"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {t.title}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {t.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {t.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="text-[11px] font-semibold text-foreground">
              Deep-Merge Type Matrix:
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-1.5">Data Type</th>
                    <th className="p-1.5">"all" Baseline</th>
                    <th className="p-1.5">OS Override</th>
                    <th className="p-1.5">Resolved Client Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-1.5 font-bold">Boolean / Number</td>
                    <td className="p-1.5 font-mono text-muted-foreground">
                      vibration_ms: 30
                    </td>
                    <td className="p-1.5 font-mono text-primary">
                      vibration_ms: 50
                    </td>
                    <td className="p-1.5 font-mono font-bold text-emerald-600">
                      vibration_ms: 50 (Replaces)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 font-bold">Unmodified Key</td>
                    <td className="p-1.5 font-mono text-muted-foreground">
                      theme: "dark"
                    </td>
                    <td className="p-1.5 text-muted-foreground italic">
                      (not specified)
                    </td>
                    <td className="p-1.5 font-mono font-bold text-emerald-600">
                      theme: "dark" (Inherited)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 font-bold">Nested Object</td>
                    <td className="p-1.5 font-mono text-muted-foreground">
                      &#123; font: "Inter", radius: 8 &#125;
                    </td>
                    <td className="p-1.5 font-mono text-primary">
                      &#123; radius: 12 &#125;
                    </td>
                    <td className="p-1.5 font-mono font-bold text-emerald-600">
                      &#123; font: "Inter", radius: 12 &#125; (Deep Merged)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 font-bold">Array</td>
                    <td className="p-1.5 font-mono text-muted-foreground">
                      ["en", "es"]
                    </td>
                    <td className="p-1.5 font-mono text-primary">
                      ["en", "hi"]
                    </td>
                    <td className="p-1.5 font-mono font-bold text-emerald-600">
                      ["en", "hi"] (Array Replaced)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },

    {
      id: "optimistic-concurrency-history",
      title: "Optimistic Concurrency & 1-Click Rollback",
      badge: "Version Safety",
      icon: History,
      summary:
        "expectedVersion locking protocol and immutable history snapshots",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            To prevent two administrators from accidentally overwriting each
            other's changes, the Remote Config API enforces strict{" "}
            <strong>Optimistic Concurrency Control (OCC)</strong>:
          </p>

          <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <strong className="font-semibold text-primary">
              The expectedVersion Protocol:
            </strong>
            <p className="text-muted-foreground">
              • <strong>Create Mode (expectedVersion = 0):</strong> Fails with
              HTTP 409 if document already exists.
              <br />•{" "}
              <strong>
                Update Mode (expectedVersion = currentVersion):
              </strong>{" "}
              The server verifies the document version hasn't changed. If
              another admin updated it in the background, a{" "}
              <code className="font-mono text-destructive">409 Conflict</code>{" "}
              error prevents accidental data loss.
              <br />• <strong>Immutable History Records:</strong> Every save
              writes a snapshot to{" "}
              <code className="font-mono">ConfigHistory</code>, recording the
              exact values, version counter, and timestamp.
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <RotateCcw className="size-4 text-primary" />
              <span>How 1-Click Rollback Works:</span>
            </div>
            <p className="text-muted-foreground">
              When an admin clicks <strong>"Rollback to v4"</strong> in the
              History drawer:
              <br />
              1. The server loads the historical snapshot from Version 4.
              <br />
              2. It applies those values as a brand-new current version (e.g.
              Version 6).
              <br />
              3. The rollback operation is completely non-destructive and
              auditable!
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "config-vs-feature-flags",
      title: "Remote Config vs. Feature Flags Decision Guide",
      badge: "Architectural Decision",
      icon: Split,
      summary: "When to use Remote Config vs. when to create a Feature Flag",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            Choosing the right system ensures clean architecture and minimal
            overhead:
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-2">Criterion</th>
                  <th className="p-2">Remote Config (config)</th>
                  <th className="p-2">Feature Flags (features)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2 font-bold">Primary Goal</td>
                  <td className="p-2">
                    Tuning constants, styling, timeouts, defaults
                  </td>
                  <td className="p-2">Binary capability gating (on/off)</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Canary Rollout %</td>
                  <td className="p-2 font-mono text-muted-foreground">
                    No (All matching clients receive it)
                  </td>
                  <td className="p-2 font-mono font-bold text-emerald-600">
                    Yes (0% to 100% FNV-1a rollout)
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Device Allow / Deny Lists</td>
                  <td className="p-2 font-mono text-muted-foreground">No</td>
                  <td className="p-2 font-mono font-bold text-emerald-600">
                    Yes (VIP testing & blacklist)
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Release Channel Rings</td>
                  <td className="p-2 font-mono text-muted-foreground">
                    No (Global across all channels)
                  </td>
                  <td className="p-2 font-mono font-bold text-emerald-600">
                    Yes (internal / beta / production)
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Deep-Merge Inheritance</td>
                  <td className="p-2 font-mono font-bold text-emerald-600">
                    Yes (all + android / ios)
                  </td>
                  <td className="p-2 font-mono text-muted-foreground">
                    No (Individual flag evaluation)
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Audit History & Rollback</td>
                  <td className="p-2 font-mono font-bold text-emerald-600">
                    Yes (Snapshots & 1-click restore)
                  </td>
                  <td className="p-2 font-mono text-muted-foreground">
                    Direct edits
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    {
      id: "prohibited-keys-mongo",
      title: "JSON Key Restrictions (MongoDB Safeguards)",
      badge: "Validation Rule",
      icon: AlertTriangle,
      summary: "Why dots and dollar signs in key names are blocked",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            MongoDB reserves the dot (<code className="font-mono">.</code>) for
            document path navigation and the dollar sign (
            <code className="font-mono">$</code>) for query operators.
          </p>

          <div className="space-y-1.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <strong className="font-semibold text-destructive">
              Key Validation Rules:
            </strong>
            <p className="text-muted-foreground">
              • Keys <strong>cannot contain dots</strong> (e.g. use{" "}
              <code className="font-mono">theme_color</code> or{" "}
              <code className="font-mono">theme:color</code> instead of{" "}
              <code className="font-mono">theme.color</code>).
              <br />• Keys <strong>cannot start with $</strong> (e.g.{" "}
              <code className="font-mono">$lookup</code>).
              <br />
              Central-UI validates your JSON in real-time to prevent 400 Bad
              Request errors.
            </p>
          </div>
        </div>
      ),
    },
  ],

  // 2. PLAYBOOKS (Operational Recipes)
  playbooks: [
    {
      id: "global-default-parameter",
      title: "Establishing a Global Default Setting",
      category: "Foundation",
      badge: "Platform: All",
      goal: "Set a baseline vibration duration of 35ms across all mobile platforms.",
      configurationSummary:
        "namespace: 'haptics' | platform: 'all' | values: { key_vibration_ms: 35, enabled: true }",
      whyItWorks:
        "The 'all' document serves as the foundation. Both Android and iOS clients automatically inherit these baseline keys without duplicate entry.",
    },

    {
      id: "os-hardware-tuning",
      title: "OS Hardware Specialization",
      category: "Platform Overrides",
      badge: "Deep Merge",
      goal: "iOS devices use Taptic Engine haptic intensity ('medium'), while Android uses millisecond durations (40ms).",
      configurationSummary:
        "all: { enabled: true } | ios: { haptic_intensity: 'medium' } | android: { vibration_ms: 40 }",
      whyItWorks:
        "The deep-merge engine layers OS-specific overrides over the 'all' baseline. Android gets vibration_ms, iOS gets haptic_intensity, and both share enabled: true.",
    },

    {
      id: "version-gating-settings",
      title: "App Version Gating for New Settings",
      category: "Crash Prevention",
      badge: "minBuildNumber",
      goal: "Build 50 introduces new AI temperature parameters that would crash older client builds if delivered.",
      configurationSummary:
        "minBuildNumber: 50 | values: { ai_engine: 'gemini-nano', temperature: 0.7 }",
      whyItWorks:
        "Clients with buildNumber < 50 filter out this document during evaluation, safely falling back to hardcoded defaults without encountering unknown keys.",
    },

    {
      id: "emergency-config-rollback",
      title: "Emergency 1-Click Configuration Rollback",
      category: "Incident Recovery",
      badge: "Rollback",
      goal: "An admin accidentally set vibration duration to 5000ms, causing continuous vibration. Restore good state instantly.",
      configurationSummary:
        "Open History drawer → Locate last known good version (e.g. v3) → Click 'Rollback to v3'",
      whyItWorks:
        "The server instantly copies snapshot v3 values into a new version counter. Worldwide mobile clients refresh on their next bootstrap call.",
    },
  ],

  // 3. TROUBLESHOOTING MATRIX
  troubleshooting: [
    {
      problem: "HTTP 409: 'Version conflict: current version is X, expected Y'",
      cause:
        "Another administrator modified and saved this config while your form was open",
      solution:
        "Refresh the configuration editor to pull the latest changes, re-apply your edits, and save again.",
      tag: "OCC Conflict",
    },
    {
      problem: "Client is not receiving new configuration keys",
      cause: "minBuildNumber threshold is set higher than client's buildNumber",
      solution:
        "Check the client's build number. Lower minBuildNumber or update the mobile test device.",
      tag: "Build Gate",
    },
    {
      problem: "Client receives old values despite admin changes",
      cause: "HTTP 304 Caching or maxBuildNumber ceiling exceeded",
      solution:
        "Verify if maxBuildNumber retired the config, or restart the client app to invalidate cached ETag.",
      tag: "Cache / ETag",
    },
    {
      problem:
        "Validation Error 400: 'Config value keys cannot start with $ or contain .'",
      cause: "MongoDB prohibited characters in JSON key names",
      solution:
        "Replace dots (.) with underscores (_) or colons (:), and remove leading dollar signs ($).",
      tag: "Key Syntax",
    },
    {
      problem: "Platform override is not applying to clients",
      cause: "Namespace spelling mismatch between 'all' and OS document",
      solution:
        "Ensure the namespace string is identical across all and android/ios documents (case-sensitive).",
      tag: "Namespace Match",
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
        "namespace",
        "string",
        "YES",
        "-",
        "Unique category key (e.g. 'keyboard_haptics'). Immutable after creation.",
      ],
      [
        "platform",
        "enum (all | android | ios)",
        "YES",
        "-",
        "Defines whether config is a global baseline ('all') or OS override.",
      ],
      [
        "values",
        "object (JSON)",
        "YES",
        "{}",
        "Key-value dictionary. Keys cannot start with '$' or contain '.'.",
      ],
      [
        "minBuildNumber",
        "integer",
        "No",
        "-",
        "Clients with buildNumber below this integer ignore this document.",
      ],
      [
        "maxBuildNumber",
        "integer",
        "No",
        "-",
        "Clients with buildNumber above this integer ignore this document.",
      ],
      [
        "expectedVersion",
        "integer",
        "No",
        "-",
        "Optimistic lock guard. Must match current version on updates to prevent race conditions.",
      ],
      [
        "version",
        "integer",
        "Auto",
        "1",
        "Monotonic counter incremented on every save and rollback snapshot.",
      ],
      [
        "updatedBy",
        "string",
        "Auto",
        "'admin'",
        "Audit identity of the administrator who committed the update.",
      ],
    ],
  },

  // 5. STEP-BY-STEP WALKTHROUGH TOUR
  tourSteps: [
    {
      id: "step-1-namespace-platform",
      title: "1. Namespace & Platform Selection",
      subtitle: "Organizing your configuration hierarchy",
      badge: "Targeting",
      description:
        "Select a logical namespace (e.g. 'theme_settings') and choose the target platform: 'all' for global defaults, or 'android'/'ios' for operating system specific overrides.",
      callout: {
        type: "tip",
        title: "Platform Best Practice",
        text: "Always define baseline settings on 'all' first. Only create platform-specific documents for keys that genuinely differ between OSs.",
      },
    },
    {
      id: "step-2-json-editor",
      title: "2. Visual JSON Editor with Real-Time Validation",
      subtitle: "Editing configuration parameters safely",
      badge: "Values",
      description:
        "Use the JSON editor to configure strings, numbers, booleans, nested dictionaries, and arrays. Real-time syntax checking alerts you immediately if syntax errors or prohibited keys exist.",
    },
    {
      id: "step-3-build-bounds",
      title: "3. App Version Gating (Min & Max Build)",
      subtitle: "Protecting older client builds from incompatible settings",
      badge: "Safety Gates",
      description:
        "Set minBuildNumber when adding settings that require newer client code. This prevents older app builds from crashing due to unexpected configuration schemas.",
    },
    {
      id: "step-4-history-rollback",
      title: "4. Audit History & 1-Click Rollback",
      subtitle: "Full traceability and instant recovery",
      badge: "Auditing",
      description:
        "Every change is tracked in the History drawer. View historical versions, compare changes, and rollback immediately with one click if any setting causes unexpected client issues.",
      callout: {
        type: "info",
        title: "Non-Destructive Rollback",
        text: "Rolling back creates a new version record containing the restored values, keeping the audit trail fully intact.",
      },
    },
  ],
}
