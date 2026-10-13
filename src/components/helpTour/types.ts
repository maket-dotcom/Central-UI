import React from "react"

export interface HelpCallout {
  type: "info" | "warning" | "tip" | "danger" | "success"
  title?: string
  text: string
}

export interface HelpTourStep {
  id: string
  title: string
  subtitle?: string
  badge?: string
  description: string | React.ReactNode
  callout?: HelpCallout
  exampleCode?: string
  exampleLanguage?: string
  customVisual?: React.ReactNode
  keyTakeaway?: string
}

export interface HelpTopic {
  id: string
  title: string
  badge?: string
  icon?: React.ComponentType<{ className?: string }>
  summary: string
  content: React.ReactNode
}

export interface HelpTroubleshootingItem {
  problem: string
  cause: string
  solution: string
  tag?: string
}

export interface HelpPlaybookItem {
  id: string
  title: string
  category?: string
  goal: string
  configurationSummary: string
  whyItWorks: string
  badge?: string
  actionLabel?: string
  onApplyPreset?: () => void
}

export interface HelpDrawerConfig {
  moduleName: string // e.g. "Feature Flags", "Remote Config", "App Releases"
  title: string
  subtitle: string
  versionTag?: string
  topics: HelpTopic[]
  tourSteps?: HelpTourStep[]
  troubleshooting?: HelpTroubleshootingItem[]
  playbooks?: HelpPlaybookItem[]
  simulatorSlot?: React.ReactNode
  quickReferenceTable?: {
    headers: string[]
    rows: (string | React.ReactNode)[][]
  }
}
