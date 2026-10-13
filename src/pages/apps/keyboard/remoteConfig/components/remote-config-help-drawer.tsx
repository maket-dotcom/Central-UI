import React from "react"
import { HelpDrawer } from "@/components/helpTour"
import { remoteConfigHelpConfig } from "../help/remote-config-help-config"

interface RemoteConfigHelpDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTopicId?: string
  initialTab?: "guide" | "playbooks" | "troubleshooting" | "simulator"
  side?: "bottom" | "right"
}

export const RemoteConfigHelpDrawer: React.FC<RemoteConfigHelpDrawerProps> = ({
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
      config={remoteConfigHelpConfig}
      initialTopicId={initialTopicId}
      initialTab={initialTab}
      side={side}
    />
  )
}
