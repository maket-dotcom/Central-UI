import React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface HelpTipProps {
  content: React.ReactNode
  onLearnMore?: () => void
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

export const HelpTip: React.FC<HelpTipProps> = ({
  content,
  onLearnMore,
  side = "top",
  className = "",
}) => {
  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              className={`inline-flex cursor-pointer items-center justify-center text-muted-foreground/70 transition-colors hover:text-foreground ${className}`}
              aria-label="Help information"
            >
              <Info className="size-3.5" />
            </button>
          }
        />
        <TooltipContent
          side={side}
          className="max-w-xs space-y-2 p-3 text-xs leading-relaxed"
        >
          <div>{content}</div>
          {onLearnMore && (
            <div className="border-t border-border/40 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onLearnMore()
                }}
                className="cursor-pointer text-[11px] font-semibold text-primary hover:underline"
              >
                Learn more in guide &rarr;
              </button>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default HelpTip
