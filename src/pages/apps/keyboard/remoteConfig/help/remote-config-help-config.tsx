import type { HelpDrawerConfig } from "@/components/helpTour/types"
import { Layers, Copy, FileCode2, CheckCircle2 } from "lucide-react"

export const remoteConfigHelpConfig: HelpDrawerConfig = {
  moduleName: "Remote Config",
  title: "Remote Configuration Operations Guide",
  subtitle: "Version-Tiered Dynamic Configuration Delivery",
  versionTag: "Remote Config v2.0",

  // 1. ARCHITECTURAL TOPICS
  topics: [
    {
      id: "version-tier-resolution",
      title: "Version-Tier Resolution Engine",
      badge: "Core Architecture",
      icon: Layers,
      summary:
        "How mobile devices receive their specific configuration tier based on app build number",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            Remote Configuration delivers runtime settings to client mobile devices
            using a deterministic single-query resolution engine based on the client's
            operating system (<strong>Android</strong> or <strong>iOS</strong>) and
            installed build number (
            <code className="font-mono text-primary">minBuildNumber</code>).
          </p>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              How Resolution Works (O(1) Indexed Lookup)
            </div>

            <div className="space-y-2">
              {[
                {
                  tier: "Step 1",
                  title: "Target Tier Lookup",
                  desc: "When a device requests /api/v1/client/config?buildNumber=X, the backend queries: platform == client.platform AND minBuildNumber <= client.buildNumber, sorted descending by minBuildNumber with limit 1.",
                },
                {
                  tier: "Step 2",
                  title: "Direct Nested JSON Payload",
                  desc: "The client receives the exact JSON values dictionary stored in that document. No complex inheritance merges or flattening.",
                },
                {
                  tier: "Step 3",
                  title: "ETag Caching (304 Not Modified)",
                  desc: "A SHA-256 ETag signature is returned with each response. If the client sends an 'If-None-Match' header matching the current payload, the server returns 304 Not Modified without payload bandwidth overhead.",
                },
              ].map((t, idx) => (
                <div
                  key={t.tier}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-2.5"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <span className="font-semibold text-foreground">{t.title}</span>
                    <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="font-semibold text-foreground">
              Example Active Build Windows:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>
                <strong>Tier 1 (minBuildNumber: 1):</strong> Active for all devices on
                Build #1 through #9.
              </li>
              <li>
                <strong>Tier 2 (minBuildNumber: 10):</strong> Active for all devices on
                Build #10 through #24.
              </li>
              <li>
                <strong>Tier 3 (minBuildNumber: 25):</strong> Active for all devices on
                Build #25 and higher (Latest active tier).
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "json-parameter-editor",
      title: "Configuration Parameters (JSON Editor)",
      badge: "Form & Validation",
      icon: FileCode2,
      summary:
        "Structuring, formatting, and validating arbitrary JSON configuration payloads",
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
          <p>
            Configuration parameters are defined as an arbitrary JSON object. This
            enables rich nested structures, arrays, feature switches, API endpoints,
            and timeout thresholds.
          </p>

          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <span className="font-semibold text-foreground">
              MongoDB Schema & Key Rules:
            </span>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>
                <strong>No '$' prefixes:</strong> Keys cannot start with{" "}
                <code className="font-mono text-primary">$</code> because MongoDB
                reserves dollar signs for query operators.
              </li>
              <li>
                <strong>No '.' dots in keys:</strong> Keys cannot contain{" "}
                <code className="font-mono text-primary">.</code> because MongoDB uses
                dot notation for nested field navigation. Use underscores (e.g.{" "}
                <code className="font-mono text-primary">theme_accent_color</code>).
              </li>
              <li>
                <strong>Arbitrary Nesting:</strong> Nested objects and arrays are fully
                supported and delivered directly to the client as JSON.
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-[11px]">
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
            <span>
              Use the built-in <strong>Prettify / Format</strong> button in the
              editor to automatically indent JSON and check for syntax errors before
              saving.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "duplicate-workflow",
      title: "Duplicate as New Version Workflow",
      badge: "Release Operations",
      icon: Copy,
      summary: "How to safely prepare configuration for an upcoming release build",
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            When preparing new settings, keys, or defaults for an upcoming app
            release, duplicate the current active tier to create a new version:
          </p>
          <ol className="list-decimal pl-4 space-y-2">
            <li>
              On the Remote Configurations list, locate the current baseline or
              active tier.
            </li>
            <li>
              Click the actions menu (<code className="font-mono text-primary">...</code>)
              and select <strong>"Duplicate"</strong>.
            </li>
            <li>
              Enter the new app binary's <strong>Minimum Build Number</strong> (e.g.
              #12).
            </li>
            <li>
              Add or modify keys in the <strong>Configuration Parameters (JSON)</strong>{" "}
              card.
            </li>
            <li>
              Click <strong>"Create Configuration"</strong> to publish the new tier.
            </li>
          </ol>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-amber-700 dark:text-amber-400">
            <strong>Zero Downtime Guarantee:</strong> Older app versions already
            in production will continue to receive their existing tier. Only devices
            running Build #12 or higher will receive the newly configured keys.
          </div>
        </div>
      ),
    },
  ],

  // 2. STEP-BY-STEP WALKTHROUGH TOUR
  tourSteps: [
    {
      id: "step-1-platform-build",
      title: "1. Target Platform & Minimum Build",
      subtitle: "The primary resolution key",
      badge: "Foundations",
      description:
        "Choose Android or iOS and set the Minimum Build Number threshold. The database enforces a strict unique constraint on (platform, minBuildNumber).",
      callout: {
        type: "tip",
        title: "Build Number Precedence",
        text: "The backend serves the highest minBuildNumber that is less than or equal to the client's build number.",
      },
    },
    {
      id: "step-2-release-note",
      title: "2. Release Note / Label",
      subtitle: "Human-readable descriptor",
      badge: "Documentation",
      description:
        "Provide a descriptive label (e.g. 'v1.4 AI Theme Rollout', 'v2.0 Baseline') so your team can easily identify why this configuration tier was created.",
    },
    {
      id: "step-3-parameters",
      title: "3. Configuration Parameters (JSON)",
      subtitle: "The client configuration dictionary",
      badge: "Payload",
      description:
        "Paste or edit JSON directly with syntax checking. Ensure key names do not contain periods '.' or start with '$'.",
      callout: {
        type: "info",
        title: "ETag Caching",
        text: "Saving changes immediately recalculates the SHA-256 ETag so clients detect the update on their next poll.",
      },
    },
  ],

  // 3. PLAYBOOKS
  playbooks: [
    {
      id: "launching-new-version",
      title: "Publishing Config for a New App Release",
      category: "Releases",
      goal:
        "Ship new configuration keys without breaking older installed app versions",
      configurationSummary:
        "Duplicate the current tier, set minBuildNumber to the new release build number, add the new keys, and publish.",
      whyItWorks:
        "Clients with build numbers lower than the new tier ignore it and continue receiving their compatible tier.",
    },
    {
      id: "hotfix-update",
      title: "Hotfixing an Active Production Tier",
      category: "Hotfixes",
      goal: "Instantly update an API endpoint or flag for existing users in the wild",
      configurationSummary:
        "Edit the existing tier for the target build range, adjust the parameter in JSON, and save changes.",
      whyItWorks:
        "Because the document minBuildNumber remains unchanged, all active devices in that build window receive the updated values on next poll.",
    },
  ],

  // 4. TROUBLESHOOTING
  troubleshooting: [
    {
      problem: "409 Conflict: Configuration Already Exists",
      cause:
        "A configuration document for the selected platform with this exact Minimum Build Number already exists.",
      solution:
        "Check the list table to verify existing build numbers. Edit the existing record or choose a different minimum build number.",
      tag: "Validation",
    },
    {
      problem: "Config keys cannot start with '$' or contain '.'",
      cause:
        "MongoDB reserves '$' for query operators and '.' for nested path navigation.",
      solution:
        "Use underscore naming conventions (e.g. 'search_provider' instead of 'search.provider').",
      tag: "Validation",
    },
    {
      problem: "Client device not receiving the latest configuration values",
      cause:
        "The client application's installed buildNumber is strictly less than the minBuildNumber of the latest tier.",
      solution:
        "Verify the client's buildNumber in device logs or update the test device to a build equal to or greater than minBuildNumber.",
      tag: "Client Resolution",
    },
  ],

  // 5. QUICK REFERENCE TABLE
  quickReferenceTable: {
    headers: ["Field", "Type", "Required", "Default", "Description"],
    rows: [
      [
        "platform",
        "enum ('android' | 'ios')",
        "YES",
        "'android'",
        "Target mobile operating system.",
      ],
      [
        "minBuildNumber",
        "integer (>= 1)",
        "YES",
        "1",
        "Minimum build integer threshold. Enforced unique per platform.",
      ],
      [
        "note",
        "string (max 250)",
        "No",
        "''",
        "Descriptive tag or changelog note for internal team reference.",
      ],
      [
        "values",
        "Record<string, any>",
        "YES",
        "{}",
        "Arbitrary JSON payload delivered to clients. Keys cannot contain '.' or start with '$'.",
      ],
      [
        "createdAt",
        "Date (ISO-8601)",
        "System",
        "Now",
        "Timestamp when the configuration document was created.",
      ],
      [
        "updatedAt",
        "Date (ISO-8601)",
        "System",
        "Now",
        "Timestamp of the most recent configuration edit.",
      ],
    ],
  },
}

export default remoteConfigHelpConfig
