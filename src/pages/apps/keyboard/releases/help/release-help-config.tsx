import type { HelpDrawerConfig } from "@/components/helpTour/types"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Radio, Flame, AlertTriangle } from "lucide-react"

export const releaseHelpConfig: HelpDrawerConfig = {
  moduleName: "App Releases",
  title: "Release Management & Update Operations Guide",
  subtitle:
    "7-Step Evaluation Pipeline, Concentric Channel Rings, and Force Update Cascades",
  versionTag: "Release Engine v1.2",

  // 1. TOPICS (Guide & Architecture)
  topics: [
    {
      id: "seven-step-pipeline",
      title: "The 7-Step Release Evaluation Pipeline",
      badge: "Core Architecture",
      icon: ShieldCheck,
      summary:
        "How update requests are evaluated sequentially to determine target build and updateType",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            Whenever a client requests bootstrap or an update check (via{" "}
            <code className="font-mono text-primary">
              /api/v1/client/bootstrap
            </code>{" "}
            or{" "}
            <code className="font-mono text-primary">
              /api/v1/client/update
            </code>
            ), the server filters and scores all active releases through a{" "}
            <strong>7-step sequential pipeline</strong>:
          </p>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Evaluation Flowchart
            </div>

            <div className="space-y-2">
              {[
                {
                  step: "Step 1",
                  title: "Eligible DB Query Filter",
                  desc: "Matches platform (android/ios), status == 'active', and channel in client's visible concentric ring.",
                  tag: "Pre-Filter",
                },
                {
                  step: "Step 2",
                  title: "Strictly Newer Build Filter",
                  desc: "release.buildNumber > client.buildNumber. Builds <= current client build are immediately discarded.",
                  tag: "Monotonic Int",
                },
                {
                  step: "Step 3",
                  title: "Deterministic Percentage Rollout Gate",
                  desc: "FNV-1a hash of (buildNumber + deviceId) must fall strictly inside the rolloutPercentage bucket.",
                  tag: "FNV-1a Hash",
                },
                {
                  step: "Step 4",
                  title: "Select Highest Candidate Build",
                  desc: "The candidate with the highest buildNumber integer is selected as the latest target release.",
                  tag: "Max Build",
                },
                {
                  step: "Step 5",
                  title: "Force Update Cascade Check",
                  desc: "Checks if latest.forceUpdate is true, if client.buildNumber < latest.minBuildNumber, or if ANY intermediate build required forceUpdate.",
                  tag: "Cascade Gate",
                },
                {
                  step: "Step 6",
                  title: "Assign updateType",
                  desc: "Emits 'force' (blocking modal) if any force rule triggered; otherwise emits 'optional' (dismissible banner).",
                  tag: "Decision",
                },
                {
                  step: "Step 7",
                  title: "Packaging & Delivery (ClientRelease DTO)",
                  desc: "Packages display metadata (downloadUrl, version, buildNumber, changelog) and the authoritative updateType. Internal DB fields are stripped to eliminate ambiguity.",
                  tag: "Clean DTO",
                },
              ].map((s, idx) => (
                <div
                  key={s.step}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-2.5 transition-colors hover:bg-muted/60"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {s.title}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {s.tag}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <strong className="font-semibold text-primary">
              The Golden Rule: Integer Build Numbers Over SemVer
            </strong>
            <p className="text-muted-foreground">
              While users read semantic versions (e.g.{" "}
              <code className="font-mono">v2.4.1</code>), the backend compares
              builds <strong>strictly as monotonic integers</strong> (
              <code className="font-mono">buildNumber: 45</code>). SemVer
              strings are never parsed for comparison logic!
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "concentric-channel-rings",
      title: "Concentric Channel Ring Visibility",
      badge: "Targeting Rules",
      icon: Radio,
      summary:
        "How Internal, Beta, and Production channels inherit release visibility",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            A frequent operational question is:{" "}
            <em>
              "Why did my Beta tester receive an update for a Production build?"
            </em>
          </p>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Concentric Ring Hierarchy
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="space-y-1.5 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    Internal Ring
                  </span>
                  <Badge
                    variant="outline"
                    className="border-purple-500/40 text-[10px] text-purple-600"
                  >
                    Broadest
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Internal testers see releases published to:
                </p>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
                    Internal
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    Beta
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Production
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    Beta Ring
                  </span>
                  <Badge
                    variant="outline"
                    className="border-blue-500/40 text-[10px] text-blue-600"
                  >
                    Medium
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Beta testers see releases published to:
                </p>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    Beta
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Production
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Production Ring
                  </span>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 text-[10px] text-emerald-600"
                  >
                    Public
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Production users only see releases published to:
                </p>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Production
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-950 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                Concentric Visibility in Releases vs. Strict Matching in
                Features
              </span>
            </div>
            <p className="opacity-90">
              In <strong>Release Management</strong>, visibility is concentric
              (internal testers can see production builds). In{" "}
              <strong>Feature Flags</strong>, channel matching is strict (a flag
              targeted to "internal" will NOT be seen by beta testers unless
              allowDevices is set).
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "force-update-cascade",
      title: "The Force Update Cascade Principle",
      badge: "Critical Behavior",
      icon: Flame,
      summary: "How intermediate mandatory releases enforce blocking updates",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            A critical safeguard prevents users who skip multiple app versions
            from bypassing mandatory security fixes or database migrations:
          </p>

          <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <strong className="font-semibold text-destructive">
              The Cascade Invariant:
            </strong>
            <p className="text-muted-foreground">
              If an administrator publishes an emergency release with{" "}
              <code className="font-mono text-destructive">
                forceUpdate: true
              </code>{" "}
              (e.g. Build 45), and later publishes an optional release with{" "}
              <code className="font-mono">forceUpdate: false</code> (Build 50):
              <br />• A client on <strong>Build 48</strong> receives Build 50 as{" "}
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-600"
              >
                optional
              </Badge>
              .
              <br />• A client on <strong>Build 40</strong> receives Build 50 as{" "}
              <Badge variant="destructive">force</Badge>, because their path to
              Build 50 crossed mandatory Build 45!
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-2">updateType</th>
                  <th className="p-2">Client Experience</th>
                  <th className="p-2">Dismissible?</th>
                  <th className="p-2">Recommended Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2 font-mono font-bold text-muted-foreground">
                    none
                  </td>
                  <td className="p-2">
                    Zero UI interruption. Keyboard launches normally.
                  </td>
                  <td className="p-2 font-mono">N/A</td>
                  <td className="p-2 text-muted-foreground">
                    Client is already on the newest available build.
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-mono font-bold text-primary">
                    optional
                  </td>
                  <td className="p-2">
                    Non-blocking update dialog or toolbar badge ("Update Now /
                    Later").
                  </td>
                  <td className="p-2 font-mono text-emerald-600">YES</td>
                  <td className="p-2 text-muted-foreground">
                    General feature additions, UI polish, minor bug fixes.
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-mono font-bold text-destructive">
                    force
                  </td>
                  <td className="p-2">
                    Full-screen non-dismissible blocker directing user to
                    downloadUrl.
                  </td>
                  <td className="p-2 font-mono text-destructive">NO</td>
                  <td className="p-2 text-muted-foreground">
                    Breaking backend API changes, critical security
                    vulnerability cutoffs.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    {
      id: "qa-single-source-truth",
      title: "QA & Mobile Verification: Single Source of Truth (updateType)",
      badge: "API Architecture",
      icon: ShieldCheck,
      summary:
        "Why mobile apps and QA must inspect update.updateType and why raw DB fields are stripped",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            When testing client responses (via{" "}
            <code className="font-mono text-primary">
              /api/v1/client/bootstrap
            </code>{" "}
            or{" "}
            <code className="font-mono text-primary">
              /api/v1/client/update
            </code>
            ), mobile apps and QA engineers must inspect{" "}
            <strong className="text-foreground">update.updateType</strong> (
            <code className="font-mono text-primary">"none"</code> |{" "}
            <code className="font-mono text-primary">"optional"</code> |{" "}
            <code className="font-mono text-primary">"force"</code>):
          </p>

          <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <strong className="font-semibold text-primary">
              1. Internal DB Attributes Stripped from ClientRelease DTO
            </strong>
            <p className="text-muted-foreground">
              Raw MongoDB database fields (<code className="font-mono">forceUpdate</code>,{" "}
              <code className="font-mono">minBuildNumber</code>,{" "}
              <code className="font-mono">rolloutPercentage</code>,{" "}
              <code className="font-mono">status</code>,{" "}
              <code className="font-mono">_id</code>,{" "}
              <code className="font-mono">__v</code>) are{" "}
              <strong>intentionally stripped</strong> from client responses.
              Clients only receive presentation metadata:{" "}
              <code className="font-mono">version</code>,{" "}
              <code className="font-mono">buildNumber</code>,{" "}
              <code className="font-mono">downloadUrl</code>, and{" "}
              <code className="font-mono">changelog</code>.
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <strong className="font-semibold text-foreground">
              2. Zero Ambiguity in Prompt Logic
            </strong>
            <p className="text-muted-foreground">
              If a release has <code className="font-mono">forceUpdate: false</code> in the database,
              but the user's current build is below <code className="font-mono">minBuildNumber</code> (or an intermediate build required a force update),
              the server evaluates the full pipeline and emits{" "}
              <Badge variant="destructive">updateType: "force"</Badge>.
              <br />
              <br />
              Because raw database booleans are omitted from the payload, the mobile app never encounters conflicting signals (e.g. seeing a "forceUpdate: false" property while receiving a force update requirement).
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "anti-spoofing-safeguard",
      title: "Anti-Spoofing Build Ceiling Safeguard (403)",
      badge: "Security Guard",
      icon: AlertTriangle,
      summary:
        "Why clients sending build numbers far in the future are blocked",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            To prevent attackers from sending fake build numbers (e.g.{" "}
            <code className="font-mono">buildNumber: 999999</code>) to probe
            unpublished releases or bypass checks, the backend maintains a
            dynamic cache of the highest registered build per platform:
          </p>

          <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
            <div className="font-mono text-[11px] text-foreground">
              if (client.buildNumber &gt; maxKnownBuild + 50) &#123;
              <br />
              &nbsp;&nbsp;return res.status(403).json(&#123; error: "Build
              number exceeds allowed threshold" &#125;)
              <br />
              &#125;
            </div>
            <p className="text-[11px] text-muted-foreground">
              If an Android dev build is compiled with a placeholder build code
              of 500 when the backend only knows build 45, requests will receive
              HTTP 403. Register a draft build or align version codes to
              resolve.
            </p>
          </div>
        </div>
      ),
    },
  ],

  // 2. PLAYBOOKS (Operational Step-by-Step Recipes)
  playbooks: [
    {
      id: "internal-alpha-apk",
      title: "Deploying an Internal Alpha APK",
      category: "Testing",
      badge: "Internal QA",
      goal: "Distribute an early alpha build exclusively to internal engineers and QA lab devices without touching beta or production users.",
      configurationSummary:
        "channel: 'internal' | status: 'active' | rolloutPercentage: 100% | forceUpdate: false",
      whyItWorks:
        "Because the release is in the 'internal' channel, only devices registered with channel: 'internal' in the Tester Registry can see it. Beta testers and public users are strictly isolated.",
    },

    {
      id: "canary-rollout-4days",
      title: "4-Day Phased Production Canary Rollout",
      category: "Production Rollout",
      badge: "Best Practice",
      goal: "Safely expand a new production build from 10% to 100% while observing Crashlytics error rates.",
      configurationSummary:
        "Day 1: 10% Canary → Day 2: 25% Early Adopters → Day 3: 50% Majority → Day 4: 100% GA",
      whyItWorks:
        "FNV-1a device bucketing is deterministic. A device in the 10% bucket is mathematically guaranteed to remain included as the rollout percentage ramps upward.",
    },

    {
      id: "selective-cutoff-upgrade",
      title: "Selective Cutoff Mandatory Upgrade",
      category: "Critical Operations",
      badge: "Targeted Force",
      goal: "Force users on legacy builds strictly below 45 to update immediately, while allowing builds 45 and above to receive flexible optional updates.",
      configurationSummary:
        "Policy: Selective Cutoff | forceUpdate: false | minBuildNumber: 45 | rolloutPercentage: 100%",
      whyItWorks:
        "Clients with buildNumber < 45 receive updateType: 'force' (blocking modal). Clients with buildNumber >= 45 receive updateType: 'optional' (dismissible banner).",
    },

    {
      id: "global-mandatory-upgrade",
      title: "Global Mandatory Upgrade (Blanket Force)",
      category: "Critical Operations",
      badge: "Immediate Action",
      goal: "Force 100% of all older client builds to update immediately before accessing the keyboard (e.g. breaking backend API changes, revoked security certs).",
      configurationSummary:
        "Policy: Global Mandatory | forceUpdate: true | minBuildNumber: null | rolloutPercentage: 100%",
      whyItWorks:
        "All clients with buildNumber strictly less than the new release build receive updateType: 'force', completely blocking keyboard access until the update is installed.",
    },

    {
      id: "archive-faulty-release",
      title: "Halting a Faulty or Crashed Release",
      category: "Rollback",
      badge: "Emergency Stop",
      goal: "A critical bug is discovered in Build 48 after publishing. Stop all pending update prompts immediately.",
      configurationSummary: "Set status to 'archived'",
      whyItWorks:
        "Gate 1 of the release evaluation engine immediately excludes archived releases. Starting from the very next client request, no device will be prompted to update to Build 48.",
    },
  ],

  // 3. TROUBLESHOOTING MATRIX
  troubleshooting: [
    {
      problem: "Client is not receiving update prompt",
      cause: "Release status is 'draft' or 'archived'",
      solution:
        "Change status to 'active'. Only active releases are evaluated for client updates.",
      tag: "Status Filter",
    },
    {
      problem: "Client does not see new build",
      cause: "Client buildNumber is >= release buildNumber",
      solution:
        "Verify client integer build number. Release checks require release.buildNumber > client.buildNumber.",
      tag: "Monotonic Build",
    },
    {
      problem: "Tester in Beta ring does not receive update",
      cause: "Release was published to 'internal' channel",
      solution:
        "Beta testers cannot see internal releases. Promote release to 'beta' or register tester device as 'internal'.",
      tag: "Channel Isolation",
    },
    {
      problem: "Device not receiving update in canary rollout",
      cause: "Device FNV-1a hash bucket falls above current rolloutPercentage",
      solution:
        "Advance rollout percentage via Quick Ramp dialog or test with a device in the active bucket.",
      tag: "Canary Bucket",
    },
    {
      problem: "Users report forced update even with forceUpdate: false",
      cause: "minBuildNumber threshold or intermediate force cascade",
      solution:
        "Check if client build is below minBuildNumber or if an older release between current and latest had forceUpdate: true.",
      tag: "Force Cascade",
    },
    {
      problem: "HTTP 409 Conflict when saving release",
      cause: "Duplicate (platform, channel, buildNumber) tuple",
      solution:
        "A release already exists with that platform, channel, and build integer. Edit the existing record instead.",
      tag: "Unique Constraint",
    },
    {
      problem: "Client receives HTTP 403 Forbidden on update check",
      cause: "Build number exceeds maxKnownBuild + 50 ceiling",
      solution:
        "Ensure test build version code matches registered app release integer range.",
      tag: "Anti-Spoofing",
    },
    {
      problem: "Setting minBuildNumber to 1 does not force Build #1 to update",
      cause: "The cutoff condition is strictly client.buildNumber < minBuildNumber. Since Android build numbers start at integer 1, 1 < 1 evaluates to false.",
      solution:
        "To force Build #1 to update, set minBuildNumber to 2. Clients on Build #1 (1 < 2) will then receive updateType: 'force', while builds >= 2 receive flexible optional prompts.",
      tag: "Threshold Math",
    },
    {
      problem: "Validation error: Minimum build cutoff must be strictly less than target release build",
      cause: "A release cannot enforce a minimum requirement equal to or greater than the target build itself.",
      solution:
        "Ensure minBuildNumber is strictly less than the release buildNumber integer (minBuildNumber < buildNumber).",
      tag: "Validation Guard",
    },
    {
      problem: "Client response JSON does not contain forceUpdate or minBuildNumber",
      cause: "By design: Internal database fields are stripped in the ClientRelease DTO",
      solution:
        "Clients and QA must evaluate update.updateType ('none' | 'optional' | 'force'). The nested release object only contains presentation metadata (version, buildNumber, downloadUrl, changelog) to prevent client-side evaluation ambiguities.",
      tag: "API Contract",
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
        "platform",
        "enum (android | ios)",
        "YES",
        "-",
        "Strict OS isolation. Clients only match their exact OS.",
      ],
      [
        "channel",
        "enum (internal | beta | production)",
        "YES",
        "-",
        "Distribution ring. Follows concentric visibility inheritance.",
      ],
      [
        "version",
        "string",
        "YES",
        "-",
        "Human-readable semantic version (e.g. '2.4.1'). Displayed in UI modals.",
      ],
      [
        "buildNumber",
        "integer",
        "YES",
        "-",
        "Monotonic comparison integer (e.g. 45). Enforced unique per platform/channel.",
      ],
      [
        "downloadUrl",
        "string (URL)",
        "YES",
        "-",
        "Direct APK URL, Play Store link, or App Store link.",
      ],
      [
        "status",
        "enum (draft | active | archived)",
        "No",
        "'draft'",
        "Only 'active' releases are evaluated for client devices.",
      ],
      [
        "forceUpdate",
        "boolean",
        "No",
        "false",
        "Forces all eligible older client builds to update immediately (Global Mandatory policy).",
      ],
      [
        "minBuildNumber",
        "integer | null",
        "No",
        "null",
        "Used in Selective Cutoff policy. Clients strictly below this build integer receive mandatory force updates; clients on or above receive optional prompts.",
      ],
      [
        "rolloutPercentage",
        "integer (0-100)",
        "No",
        "100",
        "Canary phased rollout percentage using deterministic FNV-1a hashing.",
      ],
      [
        "changelog",
        "string",
        "No",
        "''",
        "Release notes displayed to users in the in-app update prompt.",
      ],
    ],
  },

  // 5. STEP-BY-STEP WALKTHROUGH TOUR
  tourSteps: [
    {
      id: "step-1-platform-build",
      title: "1. Platform & Monotonic Build Number",
      subtitle: "The core identifiers for update matching",
      badge: "Foundations",
      description:
        "Select target OS (Android or iOS), choose the release ring (Internal, Beta, or Production), and enter the monotonic integer build number (e.g. 45). Build numbers must strictly increase with each new release.",
      callout: {
        type: "tip",
        title: "Pro-Tip",
        text: "Semantic version strings ('2.4.1') are for human reading only; the backend always evaluates release precedence by comparing buildNumber integers.",
      },
    },
    {
      id: "step-2-artifact-download",
      title: "2. Download Artifact URL & Changelog",
      subtitle: "Connecting the client to the binary package",
      badge: "Distribution",
      description:
        "Provide a secure download URL pointing to the hosted APK, Google Play Store listing, or Apple App Store. Enter human-friendly release notes in the changelog field to show users what is new.",
    },
    {
      id: "step-3-rollout-percentage",
      title: "3. Phased Canary Rollout Percentage",
      subtitle: "Gradual progressive delivery",
      badge: "Risk Mitigation",
      description:
        "Start new production releases at 10% canary. As telemetry and crash monitoring confirm stability, use the Quick Ramp dialog to advance to 25%, 50%, and finally 100% General Availability.",
      callout: {
        type: "info",
        title: "Deterministic Bucketing",
        text: "Clients in the 10% bucket are guaranteed to remain included as the rollout percentage increases.",
      },
    },
    {
      id: "step-4-force-thresholds",
      title: "4. Update Enforcement Policy",
      subtitle: "Flexible prompt vs. Selective cutoff vs. Global mandatory",
      badge: "Enforcement",
      description:
        "Choose an Update Enforcement Policy: 'Flexible' for standard optional updates, 'Selective Cutoff' (minBuildNumber) to force updates only for builds below a cutoff integer, or 'Global Mandatory' to block 100% of older builds immediately.",
      callout: {
        type: "tip",
        title: "Policy Isolation Guarantee",
        text: "Selective Cutoff automatically keeps forceUpdate disabled so builds on or above minBuildNumber receive flexible optional prompts rather than blocking screens.",
      },
    },
  ],
}
