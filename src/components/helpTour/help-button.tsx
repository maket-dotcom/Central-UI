import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Sparkles, HelpCircle } from "lucide-react"

interface HelpButtonProps {
  onClick: () => void
  label?: string
  variant?: "standard" | "outline" | "compact" | "floating"
  icon?: "book" | "sparkles" | "help"
  badge?: string
  className?: string
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  onClick,
  label = "Operations Guide & Playbooks",
  variant = "standard",
  icon = "book",
  badge,
  className = "",
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "sparkles":
        return <Sparkles className="size-3.5 text-primary" />
      case "help":
        return <HelpCircle className="size-3.5 text-primary" />
      default:
        return <BookOpen className="size-3.5 text-primary" />
    }
  }

  if (variant === "compact") {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onClick}
        title={label}
        className={`size-8 cursor-pointer rounded-lg ${className}`}
      >
        {renderIcon()}
        <span className="sr-only">{label}</span>
      </Button>
    )
  }

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`fixed right-6 bottom-6 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md transition-all hover:bg-card hover:shadow-xl ${className}`}
      >
        <Sparkles className="size-4 animate-pulse text-primary" />
        <span>{label}</span>
        {badge && (
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            {badge}
          </Badge>
        )}
      </button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`cursor-pointer gap-1.5 text-xs font-medium ${className}`}
    >
      {renderIcon()}
      <span>{label}</span>
      {badge && (
        <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
          {badge}
        </Badge>
      )}
    </Button>
  )
}

export default HelpButton
