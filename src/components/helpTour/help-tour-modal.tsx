import React, { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react"
import type { HelpTourStep, HelpCallout } from "./types"

interface HelpTourModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourTitle: string
  steps: HelpTourStep[]
  initialStepIndex?: number
  onComplete?: () => void
}

export const HelpTourModal: React.FC<HelpTourModalProps> = ({
  open,
  onOpenChange,
  tourTitle,
  steps,
  initialStepIndex = 0,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStepIndex)
  const [prevOpen, setPrevOpen] = useState(open)
  const [copied, setCopied] = useState(false)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setCurrentIndex(Math.min(initialStepIndex, Math.max(0, steps.length - 1)))
    }
  }

  const totalSteps = steps.length
  const currentStep = steps[currentIndex]

  const handleNext = useCallback(() => {
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onOpenChange(false)
      onComplete?.()
    }
  }, [currentIndex, totalSteps, onOpenChange, onComplete])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const handleRestart = () => {
    setCurrentIndex(0)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrev()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, handleNext, handlePrev])

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!currentStep) return null

  const renderCallout = (callout: HelpCallout) => {
    const iconMap = {
      info: <Info className="size-4 shrink-0 text-blue-500" />,
      warning: <AlertTriangle className="size-4 shrink-0 text-amber-500" />,
      tip: <Lightbulb className="size-4 shrink-0 text-emerald-500" />,
      danger: <AlertTriangle className="size-4 shrink-0 text-rose-500" />,
      success: <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />,
    }

    const styleMap = {
      info: "border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-200",
      warning:
        "border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-200",
      tip: "border-emerald-500/20 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200",
      danger:
        "border-rose-500/20 bg-rose-500/5 text-rose-900 dark:text-rose-200",
      success:
        "border-emerald-500/20 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200",
    }

    return (
      <Alert className={`text-xs ${styleMap[callout.type] || styleMap.info}`}>
        {iconMap[callout.type] || iconMap.info}
        {callout.title && (
          <AlertTitle className="text-xs font-semibold">
            {callout.title}
          </AlertTitle>
        )}
        <AlertDescription className="text-xs leading-relaxed text-inherit opacity-90">
          {callout.text}
        </AlertDescription>
      </Alert>
    )
  }

  const isLastStep = currentIndex === totalSteps - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl md:max-w-3xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <DialogTitle className="text-sm font-semibold tracking-tight text-foreground">
                {tourTitle}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Interactive Guided Walkthrough
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              Step {currentIndex + 1} of {totalSteps}
            </Badge>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Body (Scrollable) */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {/* Step Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {currentStep.title}
              </h3>
              {currentStep.badge && (
                <Badge variant="secondary" className="text-xs">
                  {currentStep.badge}
                </Badge>
              )}
            </div>
            {currentStep.subtitle && (
              <p className="text-xs font-medium text-muted-foreground">
                {currentStep.subtitle}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="text-sm leading-relaxed text-muted-foreground">
            {typeof currentStep.description === "string" ? (
              <p>{currentStep.description}</p>
            ) : (
              currentStep.description
            )}
          </div>

          {/* Custom Visual (Diagram / Pipeline / Chart) */}
          {currentStep.customVisual && (
            <div className="rounded-xl border border-border bg-card/60 p-4">
              {currentStep.customVisual}
            </div>
          )}

          {/* Example Code Block */}
          {currentStep.exampleCode && (
            <div className="relative rounded-lg border border-border bg-muted/40 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground">
                <span>{currentStep.exampleLanguage || "JSON Payload"}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(currentStep.exampleCode!)}
                  className="flex cursor-pointer items-center gap-1 hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-foreground">
                <code>{currentStep.exampleCode}</code>
              </pre>
            </div>
          )}

          {/* Callout Box */}
          {currentStep.callout && renderCallout(currentStep.callout)}

          {/* Key Takeaway */}
          {currentStep.keyTakeaway && (
            <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <strong className="font-semibold text-primary">
                  Rule of Thumb:{" "}
                </strong>
                <span className="text-muted-foreground">
                  {currentStep.keyTakeaway}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-3.5">
          <div className="flex items-center gap-1.5">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 cursor-pointer rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-6 bg-primary"
                    : idx < currentIndex
                      ? "w-2 bg-primary/40 hover:bg-primary/60"
                      : "w-2 bg-muted hover:bg-muted-foreground/40"
                }`}
                title={`Go to step ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRestart}
                title="Restart from beginning"
                className="gap-1 text-xs"
              >
                <RotateCcw className="size-3" />
                Restart
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleNext}
              className="gap-1 text-xs font-semibold"
            >
              {isLastStep ? "Finish Tour" : "Next"}
              {!isLastStep && <ChevronRight className="size-3.5" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default HelpTourModal
