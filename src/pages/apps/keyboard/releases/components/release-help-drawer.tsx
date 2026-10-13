import React from "react"
import { HelpDrawer } from "@/components/helpTour"
import { releaseHelpConfig } from "../help/release-help-config"

interface ReleaseHelpDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTopicId?: string
  initialTab?: "guide" | "playbooks" | "troubleshooting" | "simulator"
  side?: "bottom" | "right"
}

export const ReleaseHelpDrawer: React.FC<ReleaseHelpDrawerProps> = ({
  open,
  onOpenChange,
  initialTopicId,
  initialTab = "guide",
  side = "bottom",
}) => {
  return (
    <HelpDrawer
      open={open}
      onOpenChange={onOpenChange}
      config={releaseHelpConfig}
      initialTopicId={initialTopicId}
      initialTab={initialTab}
      side={side}
    />
  )
}
