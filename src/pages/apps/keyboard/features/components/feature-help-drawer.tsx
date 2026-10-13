import React from "react"
import { HelpDrawer } from "@/components/helpTour"
import { featureFlagHelpConfig } from "../help/feature-flag-help-config"
import {
  FeatureSimulatorCard,
  type FlagSimulationConfig,
} from "./feature-simulator-card"

interface FeatureHelpDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTopicId?: string
  initialTab?: "guide" | "playbooks" | "troubleshooting" | "simulator"
  activeFlagConfig?: FlagSimulationConfig
  side?: "bottom" | "right"
}

export const FeatureHelpDrawer: React.FC<FeatureHelpDrawerProps> = ({
  open,
  onOpenChange,
  initialTopicId,
  initialTab = "guide",
  activeFlagConfig,
  side = "bottom",
}) => {
  // If activeFlagConfig is provided, inject it into simulatorSlot
  const config = React.useMemo(() => {
    if (!activeFlagConfig) return featureFlagHelpConfig
    return {
      ...featureFlagHelpConfig,
      simulatorSlot: <FeatureSimulatorCard flagConfig={activeFlagConfig} />,
    }
  }, [activeFlagConfig])

  return (
    <HelpDrawer
      open={open}
      onOpenChange={onOpenChange}
      config={config}
      initialTopicId={initialTopicId}
      initialTab={initialTab}
      side={side}
    />
  )
}

export default FeatureHelpDrawer
