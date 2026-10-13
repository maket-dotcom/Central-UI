import type { HelpDrawerConfig } from "@/components/helpTour/types"
import { FeatureGateVisualizer } from "../components/feature-gate-visualizer"
import { FeatureSimulatorCard } from "../components/feature-simulator-card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  Zap,
  Sliders,
  Sparkles,
  Layers,
  AlertTriangle,
} from "lucide-react"

export const featureFlagHelpConfig: HelpDrawerConfig = {
  moduleName: "Feature Flags",
  title: "Feature Configuration & Flags Guide",
  subtitle:
    "7-Gate Evaluation Pipeline, Canary Rollouts, and VIP Bypass Architecture",
  versionTag: "7-Gate Engine v1.4",

  // 1. TOPICS (Guide & Architecture)
  topics: [
    {
      id: "seven-gate-pipeline",
      title: "The 7-Gate Evaluation Pipeline",
      badge: "Core Architecture",
      icon: ShieldCheck,
      summary:
        "How requests are evaluated sequentially from Gate 1 down to Gate 7",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            Whenever a client device requests its configuration (via{" "}
            <code className="font-mono text-primary">
              /api/v1/client/bootstrap
            </code>{" "}
            or{" "}
            <code className="font-mono text-primary">
              /api/v1/client/features
            </code>
            ), the server evaluates every feature flag through{" "}
            <strong>7 sequential gates in strict priority order</strong>:
          </p>

          <FeatureGateVisualizer />

          <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <strong className="font-semibold text-primary">
              The Explicit Status Contract:
            </strong>
            <p className="text-muted-foreground">
              Every registered feature in the database returns an explicit
              status object:
              <br />• When active for the client:{" "}
              <code className="font-mono text-emerald-600 dark:text-emerald-400">
                &#123; "enabled": true, "payload": &#123; ... &#125; &#125;
              </code>
              <br />• When inactive for the client:{" "}
              <code className="font-mono text-muted-foreground">
                &#123; "enabled": false &#125;
              </code>
              <br />
              Unregistered or deleted feature keys are completely absent from
              the dictionary, prompting mobile apps to use safe hardcoded
              fallbacks.
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "vip-bypass-case-study",
      title: "Deep-Dive: Allow List VIP Bypass vs. Tester Channels",
      badge: "Critical Gotcha",
      icon: Zap,
      summary: "Why a Beta device received an Internal-only flag at 0% rollout",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-950 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                Real-World Scenario: "Why Did My Beta Device Get an Internal
                Flag?"
              </span>
            </div>
            <p className="opacity-90">
              An admin configured feature{" "}
              <code className="font-mono font-bold">giphy</code> with:
              <br />• Channels: <code className="font-mono">["internal"]</code>
              <br />• Rollout: <code className="font-mono">0%</code>
              <br />• Allow Devices:{" "}
              <code className="font-mono">["dd95dfecd2ce8005"]</code>
            </p>
            <p className="opacity-90">
              In the Tester Registry, device{" "}
              <code className="font-mono">dd95dfecd2ce8005</code> was assigned
              to channel <code className="font-mono font-bold">beta</code>. Yet,
              the mobile app received:
              <br />
              <code className="mt-1 block rounded bg-background/80 p-1.5 font-mono text-[11px]">
                &#123; "channel": "beta", "features": &#123; "giphy": &#123;
                "enabled": true &#125; &#125; &#125;
              </code>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-foreground">Why Did This Happen?</h4>
            <p className="text-muted-foreground">
              Because{" "}
              <strong>Gate 3 (Allow List) is an instant VIP Fast-Track!</strong>
              <br />
              1. Gate 1 (Master Switch: true) &#10132; <strong>Passed</strong>.
              <br />
              2. Gate 2 (Deny List: not denied) &#10132; <strong>Passed</strong>
              .
              <br />
              3. Gate 3 (Allow List): Device{" "}
              <code className="font-mono">dd95dfecd2ce8005</code> was present in{" "}
              <code className="font-mono">allowDevices</code>!
              <br />
              👉{" "}
              <strong>
                The server immediately returned &#123; "enabled": true &#125;!
              </strong>
            </p>
            <p className="text-muted-foreground">
              Gates 4, 5, 6, and 7 were <strong>completely skipped</strong>:
              <br />• Channel check (<code className="font-mono">
                internal
              </code>{" "}
              vs <code className="font-mono">beta</code>) was{" "}
              <em>never evaluated</em>.
              <br />• Rollout check (<code className="font-mono">0%</code>) was{" "}
              <em>never evaluated</em>.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="font-bold text-foreground">
              What Does `allowDevices` Bypass?
            </h4>
            <div className="overflow-hidden rounded-lg border border-border text-[11px]">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="p-2 font-semibold">Targeted Rule</th>
                    <th className="p-2 font-semibold">
                      When in `allowDevices`
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-2 font-mono">
                      Master Switch (enabled: false)
                    </td>
                    <td className="p-2 font-medium text-rose-500">
                      ❌ Does NOT bypass (Flag is globally OFF)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">Deny List (denyDevices)</td>
                    <td className="p-2 font-medium text-rose-500">
                      ❌ Does NOT bypass (Deny list always wins)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">Platform Gate (platforms)</td>
                    <td className="p-2 font-medium text-emerald-600 dark:text-emerald-400">
                      ⚡ Bypasses (Receives on any OS)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">Channel Gate (channels)</td>
                    <td className="p-2 font-medium text-emerald-600 dark:text-emerald-400">
                      ⚡ Bypasses (Beta gets Internal flags)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">
                      Build Bounds (min/maxBuild)
                    </td>
                    <td className="p-2 font-medium text-emerald-600 dark:text-emerald-400">
                      ⚡ Bypasses (Old/new builds receive it)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">Rollout % (0% to 100%)</td>
                    <td className="p-2 font-medium text-emerald-600 dark:text-emerald-400">
                      ⚡ Bypasses (Receives even at 0% rollout)
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
      id: "testing-strategies",
      title: "Testing Strategy: Channels vs. VIP Whitelist",
      badge: "Best Practice",
      icon: Sliders,
      summary:
        "How to choose between Tester Channel Rings and direct allowDevices",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            Depending on what you want to achieve, choose one of these two
            strategies:
          </p>

          <div className="space-y-2 rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px]">
                Strategy A
              </Badge>
              <span className="font-bold text-foreground">
                Ring-Based Testing (Recommended for QA Teams)
              </span>
            </div>
            <p className="text-muted-foreground">
              <strong>Goal:</strong> All registered{" "}
              <code className="font-mono">internal</code> testers get a feature,
              but NO <code className="font-mono">beta</code> or{" "}
              <code className="font-mono">production</code> testers get it.
            </p>
            <div className="space-y-1 rounded-lg bg-muted/40 p-2.5 font-mono text-[11px]">
              <div>1. Register device in Testers with channel: "internal"</div>
              <div>2. Set feature channels: ["internal"]</div>
              <div>3. Set rolloutPercentage: 100</div>
              <div className="font-bold text-amber-600 dark:text-amber-400">
                4. Leave allowDevices: [] EMPTY!
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                Strategy B
              </Badge>
              <span className="font-bold text-foreground">
                Direct VIP Whitelist (One-Off Dev Debugging)
              </span>
            </div>
            <p className="text-muted-foreground">
              <strong>Goal:</strong> Test on a single physical phone without
              affecting tester rings.
            </p>
            <div className="space-y-1 rounded-lg bg-muted/40 p-2.5 font-mono text-[11px]">
              <div>1. Add device ID to allowDevices: ["&lt;DEVICE_ID&gt;"]</div>
              <div>2. Set rolloutPercentage: 0</div>
              <div>3. Channels can be ["internal"] or anything else</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                Outcome: Only that device gets true. 100% of everyone else gets
                false.
              </div>
            </div>
          </div>
        </div>
      ),
    },

    {
      id: "canary-rollouts",
      title: "Phased Canary Rollouts & Monotonicity",
      badge: "Release Engine",
      icon: Sparkles,
      summary: "Deterministic FNV-1a hashing and safe 4-stage gradual rollouts",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            Rollouts use deterministic hashing based on{" "}
            <code className="font-mono">deviceId</code> and{" "}
            <code className="font-mono">flagKey</code>:
            <br />
            <code className="font-mono font-bold text-primary">
              crc32(flagKey + ":" + deviceId) % 100 &lt; rolloutPercentage
            </code>
          </p>

          <div className="space-y-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <strong className="font-semibold text-emerald-700 dark:text-emerald-300">
              The Monotonicity Guarantee:
            </strong>
            <p className="text-muted-foreground">
              A device that enters a 10% rollout bucket is{" "}
              <strong>mathematically guaranteed</strong> to stay enabled when
              rollout expands to 25%, 50%, or 100%. No random toggling occurs
              between app sessions or device reboots.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-foreground">
              Standard 4-Stage Rollout Schedule:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="space-y-1 rounded-lg border border-border bg-card p-2.5">
                <Badge variant="outline" className="text-[10px]">
                  Stage 1 — Canary
                </Badge>
                <div className="font-bold">10% Rollout</div>
                <p className="text-muted-foreground">
                  Keep for 24h. Monitor backend error telemetry.
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border bg-card p-2.5">
                <Badge variant="outline" className="text-[10px]">
                  Stage 2 — Early
                </Badge>
                <div className="font-bold">25% Rollout</div>
                <p className="text-muted-foreground">
                  Monitor crash analytics and server load.
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border bg-card p-2.5">
                <Badge variant="outline" className="text-[10px]">
                  Stage 3 — Majority
                </Badge>
                <div className="font-bold">50% Rollout</div>
                <p className="text-muted-foreground">
                  Verify performance on diverse device pool.
                </p>
              </div>
              <div className="space-y-1 rounded-lg border border-border bg-card p-2.5">
                <Badge variant="outline" className="text-[10px]">
                  Stage 4 — GA
                </Badge>
                <div className="font-bold">100% Rollout</div>
                <p className="text-muted-foreground">
                  General availability to all active devices.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-950 dark:text-rose-200">
            <strong className="font-bold">
              ⚠️ Warning on Decreasing Rollout:
            </strong>
            <p className="mt-0.5 text-[11px]">
              Dialing backwards (e.g. 50% &#10132; 25%) will revoke access for
              active users in buckets 26–50. Only dial down for emergency
              rollbacks!
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "feature-vs-remote-config",
      title: "Feature Flags vs. Remote Config: Which to Use?",
      badge: "Decision Matrix",
      icon: Layers,
      summary: "Rule of thumb for flags vs dynamic remote configuration",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="overflow-hidden rounded-lg border border-border text-[11px]">
            <table className="w-full text-left">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-2 font-semibold">Requirement</th>
                  <th className="p-2 text-center font-semibold">
                    Feature Flag
                  </th>
                  <th className="p-2 text-center font-semibold">
                    Remote Config
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2 font-medium">
                    On/Off binary feature gate
                  </td>
                  <td className="p-2 text-center font-bold text-emerald-600">
                    &#10003; Yes
                  </td>
                  <td className="p-2 text-center text-muted-foreground">
                    &#10007; No
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">
                    Percentage rollout (0% ➔ 100%)
                  </td>
                  <td className="p-2 text-center font-bold text-emerald-600">
                    &#10003; Yes
                  </td>
                  <td className="p-2 text-center text-muted-foreground">
                    &#10007; No
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">
                    Allow / Deny list by Device ID
                  </td>
                  <td className="p-2 text-center font-bold text-emerald-600">
                    &#10003; Yes
                  </td>
                  <td className="p-2 text-center text-muted-foreground">
                    &#10007; No
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">
                    Platform / Channel targeting
                  </td>
                  <td className="p-2 text-center font-bold text-emerald-600">
                    &#10003; Yes
                  </td>
                  <td className="p-2 text-center text-muted-foreground">
                    &#10007; No
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">
                    App settings defaults (sound, haptic)
                  </td>
                  <td className="p-2 text-center text-muted-foreground">
                    &#10007; No
                  </td>
                  <td className="p-2 text-center font-bold text-emerald-600">
                    &#10003; Yes
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">
                    Dynamic parameters with a flag
                  </td>
                  <td className="p-2 text-center font-bold text-emerald-600">
                    &#10003; Yes (via payload)
                  </td>
                  <td className="p-2 text-center text-muted-foreground">
                    &#10007; No
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <strong className="font-semibold text-primary">
              Rule of Thumb:
            </strong>
            <p className="text-muted-foreground">
              • Use <strong>Feature Flags</strong> for{" "}
              <em>"Should this user receive or see this feature at all?"</em>
              <br />• Use <strong>Remote Config</strong> for{" "}
              <em>
                "What default values or styling parameters should be used across
                the app?"
              </em>
            </p>
          </div>
        </div>
      ),
    },
  ],

  // 2. TOUR STEPS (Interactive Walkthrough Modal)
  tourSteps: [
    {
      id: "tour-step-1",
      title: "1. The Explicit Status Contract",
      subtitle: "Deterministic JSON Response Architecture",
      badge: "Architecture",
      description:
        "Every registered feature flag returns an explicit boolean status object. If a device qualifies, it receives enabled: true with its payload. If excluded by any gate, it receives enabled: false.",
      exampleCode: `// When active for device:
"giphy": {
  "enabled": true,
  "payload": { "rating": "pg-13", "limit": 20 }
}

// When inactive for device:
"theme_builder": {
  "enabled": false
}`,
      exampleLanguage: "JSON Mobile Response",
      callout: {
        type: "info",
        title: "Clean Defaults",
        text: "Unregistered or deleted keys are completely absent from the dictionary, allowing apps to fall back cleanly to safe hardcoded defaults.",
      },
      keyTakeaway:
        "A flag is never omitted if it exists in the database — it explicitly returns enabled: true or enabled: false.",
    },

    {
      id: "tour-step-2",
      title: "2. The 7-Gate Evaluation Pipeline",
      subtitle: "Sequential Priority Order",
      badge: "Evaluation Engine",
      description:
        "When an app requests bootstrap or features, the backend evaluates the flag through 7 sequential gates in strict order: Master Switch ➔ Deny List ➔ Allow List ➔ Platform ➔ Channel ➔ Build Thresholds ➔ Rollout %.",
      customVisual: <FeatureGateVisualizer highlightVipBypass={true} />,
      callout: {
        type: "warning",
        title: "Evaluation Order Is Critical",
        text: "Higher priority gates short-circuit lower gates. Master Switch (Gate 1) and Deny List (Gate 2) preempt everything.",
      },
      keyTakeaway:
        "If any gate fails before Gate 7, the flag is immediately returned as enabled: false.",
    },

    {
      id: "tour-step-3",
      title: "3. The Allow List VIP Fast-Track",
      subtitle: "Why allowDevices skips Channel and 0% Rollout",
      badge: "VIP Architecture",
      description: (
        <span>
          If a device is in{" "}
          <code className="font-mono font-bold text-foreground">
            allowDevices
          </code>
          , it hits Gate 3 and{" "}
          <strong>immediately exits with enabled: true</strong>. Gates 4, 5, 6,
          and 7 are completely bypassed!
        </span>
      ),
      exampleCode: `// Feature: Channels: ["internal"], Rollout: 0%
// allowDevices: ["dd95dfecd2ce8005"]
// Device: Channel: "beta"

// Gate 3 matches device ID!
// -> Returns { "enabled": true } immediately!
// Channel "beta" vs "internal" is NEVER checked!`,
      exampleLanguage: "Evaluation Trace",
      callout: {
        type: "warning",
        title: "Tester Channel Trap",
        text: "If you want to test with Beta or Internal testers properly, keep allowDevices EMPTY and use channel targeting with 100% rollout!",
      },
      keyTakeaway:
        "allowDevices is for 1-off VIP testing. For QA rings, use Channels with an empty allow list.",
    },

    {
      id: "tour-step-4",
      title: "4. Canary Rollouts & Monotonicity",
      subtitle: "Stable FNV-1a Percentage Bucketing",
      badge: "Release Safety",
      description:
        "Rollout percentages use deterministic hashing based on flagKey and deviceId. Users are partitioned into fixed 0–99 buckets. When expanding from 10% to 25%, users already in the 10% bucket never lose access.",
      callout: {
        type: "danger",
        title: "Decreasing Rollout Revokes Access",
        text: "Never decrease rollout percentage (e.g. 50% to 25%) during routine operations, as active users in buckets 26–50 will suddenly lose access. Only dial down for emergency rollbacks.",
      },
      keyTakeaway:
        "Use the 4-Stage canary progression: 10% ➔ 25% ➔ 50% ➔ 100% with at least 24 hours observation between bumps.",
    },

    {
      id: "tour-step-5",
      title: "5. App Version Gating (minBuildNumber)",
      subtitle: "Preventing Native Code Crashes",
      badge: "Version Gating",
      description:
        "If a new feature relies on native IME code or Jetpack Compose UI compiled into Build 52, older APKs (Build 51 or lower) would crash if enabled. Setting minBuildNumber ensures older builds receive enabled: false.",
      exampleCode: `{
  "key": "gesture_cursor_glide",
  "minBuildNumber": {
    "android": 52,
    "ios": 24
  },
  "rolloutPercentage": 100
}`,
      exampleLanguage: "JSON Configuration",
      callout: {
        type: "warning",
        title: "Never Exceed Play Store Live Builds",
        text: "Setting minBuildNumber higher than the highest build uploaded to Google Play Console will lock out 100% of production users.",
      },
      keyTakeaway:
        "Only set minBuildNumber when native compiled code is strictly required.",
    },

    {
      id: "tour-step-6",
      title: "6. Device Limits & Emergency Blacklisting",
      subtitle: "The 50 Device Ceiling and Gate 2 Denylist",
      badge: "Operational Safety",
      description:
        "The backend strictly enforces a ceiling of 50 devices for allowDevices and 50 devices for denyDevices. If a device crash-loops on a feature, add it to denyDevices (Gate 2) to force it off immediately without rolling back all users.",
      callout: {
        type: "tip",
        title: "Clean Up After 100% Rollout",
        text: "Once a feature reaches 100% GA, remove test devices from allowDevices to keep the list clean and avoid hitting the 50-device limit.",
      },
      keyTakeaway:
        "Deny list (Gate 2) overrules everything, including 100% rollout and explicit entries in allowDevices.",
    },
  ],

  // 3. OPERATIONAL PLAYBOOKS
  playbooks: [
    {
      id: "playbook-1",
      title: "1. Internal Dogfooding (VIP Dev Access)",
      goal: "Allow developers/QA to test on physical phones without public users receiving the feature.",
      configurationSummary: `enabled: true
rolloutPercentage: 0
allowDevices: ["<YOUR_DEVICE_ID>"]`,
      whyItWorks:
        "rolloutPercentage: 0 keeps standard users disabled. Only devices in allowDevices bypass Gate 7 and receive enabled: true.",
      badge: "VIP Testing",
    },
    {
      id: "playbook-2",
      title: "2. Phased Canary Rollout (Gradual 4-Stage Release)",
      goal: "Safely ramp up a risky or heavy feature while observing crash telemetry and server metrics.",
      configurationSummary: `Stage 1 (Canary): rolloutPercentage: 10 (Wait 24h)
Stage 2 (Early):  rolloutPercentage: 25 (Wait 24h)
Stage 3 (Maj):    rolloutPercentage: 50
Stage 4 (GA):     rolloutPercentage: 100`,
      whyItWorks:
        "Monotonic FNV-1a hashing guarantees users in bucket 10% never lose access when expanding to 25% or 50%.",
      badge: "Release",
    },
    {
      id: "playbook-3",
      title: "3. App Version Gating (minBuildNumber)",
      goal: "Feature requires native C++/IME or Jetpack Compose UI compiled only in Build 52.",
      configurationSummary: `enabled: true
minBuildNumber: { "android": 52 }
rolloutPercentage: 100`,
      whyItWorks:
        "Gate 6 checks client.buildNumber >= 52. Devices on build 51 or lower receive enabled: false.",
      badge: "Version Gating",
    },
    {
      id: "playbook-4",
      title: "4. Platform-Specific Feature Isolation",
      goal: "Deliver an Android-exclusive capability not yet implemented for iOS.",
      configurationSummary: `enabled: true
platforms: ["android"]
rolloutPercentage: 100`,
      whyItWorks: "Gate 4 excludes iOS requests with enabled: false.",
      badge: "Platform",
    },
    {
      id: "playbook-5",
      title: "5. Channel-Based Ring Deployment (Beta Testers)",
      goal: "Deliver feature to all Google Play Beta testers while keeping Production disabled.",
      configurationSummary: `enabled: true
channels: ["internal", "beta"]
rolloutPercentage: 100
allowDevices: [] (Must be EMPTY!)`,
      whyItWorks:
        "Only clients with X-Channel internal or beta pass Gate 5. Production users receive enabled: false.",
      badge: "Channels",
    },
    {
      id: "playbook-6",
      title: "6. Global Emergency Kill-Switch",
      goal: "A third-party dependency (e.g. Giphy API) crashes or leaks memory.",
      configurationSummary: `PATCH /api/v1/admin/features/:key
{ "enabled": false }`,
      whyItWorks:
        "Gate 1 evaluates first. 100% of devices worldwide receive enabled: false immediately.",
      badge: "Emergency",
    },
    {
      id: "playbook-7",
      title: "7. Targeted Emergency Blacklist (denyDevices)",
      goal: "A specific device is stuck in an ANR, but 99.9% of users are healthy.",
      configurationSummary: `denyDevices: ["<FAULTY_DEVICE_UUID>"]`,
      whyItWorks:
        "Gate 2 executes immediately. Device receives enabled: false even if rollout is 100% or in allowDevices.",
      badge: "Emergency",
    },
    {
      id: "playbook-8",
      title: "8. Retiring & Sunsetting Feature Flags",
      goal: "Feature has run at 100% for multiple releases and code defaults to true.",
      configurationSummary: `DELETE /api/v1/admin/features/:key`,
      whyItWorks:
        "Key is permanently removed from database. Mobile apps safely fall back to compiled defaults.",
      badge: "Cleanup",
    },
  ],

  // 4. TROUBLESHOOTING MATRIX
  troubleshooting: [
    {
      problem: "Device receives flag even though rollout is 0%",
      cause: "Device ID is present in allowDevices (Gate 3).",
      solution:
        "Gate 3 is a VIP Fast-Track that bypasses rollout percentage. Remove device ID from allowDevices to enforce 0% rollout.",
      tag: "VIP Bypass",
    },
    {
      problem: "Beta device receives Internal-only flag",
      cause: "Device ID is present in allowDevices (Gate 3).",
      solution:
        "Gate 3 bypasses Channel Gate checks. To enforce Channel checks, remove device from allowDevices and rely on channels: ['internal'].",
      tag: "VIP Bypass",
    },
    {
      problem: "Device not receiving flag even though enabled is true",
      cause:
        "Device in denyDevices, build number too low, channel mismatch, or FNV-1a hash bucket not reached.",
      solution:
        "Run device ID in the 7-Gate Simulator below to trace the exact failing gate.",
      tag: "Targeting",
    },
    {
      problem: "All production users abruptly lost a feature",
      cause:
        "Master switch toggled off or minBuildNumber was accidentally set higher than current live APK.",
      solution:
        "Check Master Switch in Admin Table. Verify minBuildNumber does not exceed current Play Store release build.",
      tag: "Outage",
    },
    {
      problem: "Cannot save Allow / Deny list (Validation Error 400)",
      cause: "Exceeded 50 devices limit per list.",
      solution:
        "Backend limits allowDevices and denyDevices to 50 items. Prune old test devices to make room.",
      tag: "Validation",
    },
    {
      problem: "Rollout % was decreased and users complained",
      cause: "Rollout was dialed backwards (e.g. 50% to 25%).",
      solution:
        "Decreasing rollout revokes access for users in buckets 26–50. Restore rollout percentage to 50% or higher.",
      tag: "Canary",
    },
  ],

  // 5. SIMULATOR SLOT
  simulatorSlot: (
    <FeatureSimulatorCard
      flagConfig={{
        key: "giphy",
        enabled: true,
        channels: ["internal"],
        rolloutPercentage: 0,
        allowDevices: ["dd95dfecd2ce8005"],
        denyDevices: [],
        platforms: ["android", "ios"],
        payload: { rating: "pg-13" },
      }}
    />
  ),
}

export default featureFlagHelpConfig
