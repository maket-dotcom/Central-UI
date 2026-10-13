import React from "react"
import { HelpDrawer } from "@/components/helpTour"
import { testerHelpConfig } from "../help/tester-help-config"

interface TesterHelpDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTopicId?: string
  initialTab?: "guide" | "playbooks" | "troubleshooting" | "simulator"
  side?: "bottom" | "right"
}

export const TesterHelpDrawer: React.FC<TesterHelpDrawerProps> = ({
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
      config={testerHelpConfig}
      initialTopicId={initialTopicId}
      initialTab={initialTab}
      side={side}
    />
  )
}
