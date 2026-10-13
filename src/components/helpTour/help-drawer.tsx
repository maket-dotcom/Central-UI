import React, { useState, useMemo } from "react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import {
  BookOpen,
  Search,
  Sparkles,
  FileText,
  Sliders,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import type { HelpDrawerConfig } from "./types"
import { HelpTourModal } from "./help-tour-modal"

interface HelpDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: HelpDrawerConfig
  initialTab?: "guide" | "playbooks" | "troubleshooting" | "simulator"
  initialTopicId?: string
  side?: "bottom" | "right"
}

export const HelpDrawer: React.FC<HelpDrawerProps> = ({
  open,
  onOpenChange,
  config,
  initialTab = "guide",
  initialTopicId,
  side = "bottom",
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [searchQuery, setSearchQuery] = useState("")
  const [userSelectedTopicId, setUserSelectedTopicId] = useState<string | null>(
    null
  )
  const [prevInitialTopicId, setPrevInitialTopicId] = useState<
    string | undefined
  >(initialTopicId)
  const [tourOpen, setTourOpen] = useState(false)

  if (initialTopicId !== prevInitialTopicId) {
    setPrevInitialTopicId(initialTopicId)
    setUserSelectedTopicId(null)
  }

  const effectiveTopicId =
    userSelectedTopicId || initialTopicId || (config.topics[0]?.id ?? null)

  // Filter topics
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return config.topics
    const q = searchQuery.toLowerCase().trim()
    return config.topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)
    )
  }, [config.topics, searchQuery])

  // Filter playbooks
  const filteredPlaybooks = useMemo(() => {
    if (!config.playbooks) return []
    if (!searchQuery.trim()) return config.playbooks
    const q = searchQuery.toLowerCase().trim()
    return config.playbooks.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.goal.toLowerCase().includes(q) ||
        p.configurationSummary.toLowerCase().includes(q)
    )
  }, [config.playbooks, searchQuery])

  // Filter troubleshooting
  const filteredTroubleshooting = useMemo(() => {
    if (!config.troubleshooting) return []
    if (!searchQuery.trim()) return config.troubleshooting
    const q = searchQuery.toLowerCase().trim()
    return config.troubleshooting.filter(
      (item) =>
        item.problem.toLowerCase().includes(q) ||
        item.cause.toLowerCase().includes(q) ||
        item.solution.toLowerCase().includes(q)
    )
  }, [config.troubleshooting, searchQuery])

  const selectedTopic = useMemo(() => {
    return (
      config.topics.find((t) => t.id === effectiveTopicId) ||
      config.topics[0] ||
      null
    )
  }, [config.topics, effectiveTopicId])

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={side}
          className={
            side === "bottom"
              ? "flex h-[85vh] max-h-[90vh] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-background p-0 shadow-2xl"
              : "flex w-full flex-col bg-background p-0 text-foreground sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
          }
        >
          {/* Grab handle for bottom drawer */}
          {side === "bottom" && (
            <div className="flex shrink-0 justify-center pt-2.5 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as string)}
            className="flex h-full min-h-0 flex-col"
          >
            {/* Top Header */}
            <div className="shrink-0 border-b border-border bg-muted/20 px-6 py-4">
              <div className="flex flex-col justify-between gap-3 pr-8 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <SheetTitle className="text-base font-bold text-foreground">
                        {config.title}
                      </SheetTitle>
                      {config.versionTag && (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {config.versionTag}
                        </Badge>
                      )}
                    </div>
                    <SheetDescription className="text-xs text-muted-foreground">
                      {config.subtitle}
                    </SheetDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <InputGroup className="w-56 md:w-72">
                    <InputGroupAddon align="inline-start">
                      <Search className="size-3.5" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder={`Search ${config.moduleName} guides...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 bg-background text-xs"
                    />
                  </InputGroup>

                  {config.tourSteps && config.tourSteps.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTourOpen(true)}
                      className="h-8 shrink-0 cursor-pointer gap-1.5 text-xs font-semibold"
                    >
                      <Sparkles className="size-3.5 text-primary" />
                      <span>Interactive Tour</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Navigation TabsList */}
              <TabsList
                variant="line"
                className="mt-3 w-full justify-start gap-1 overflow-x-auto border-t border-border/50 pt-2.5"
              >
                <TabsTrigger
                  value="guide"
                  className="cursor-pointer gap-1.5 text-xs"
                >
                  <FileText className="size-3.5" />
                  <span>Guide & Architecture</span>
                </TabsTrigger>

                {config.playbooks && config.playbooks.length > 0 && (
                  <TabsTrigger
                    value="playbooks"
                    className="cursor-pointer gap-1.5 text-xs"
                  >
                    <Sliders className="size-3.5" />
                    <span>Playbooks ({config.playbooks.length})</span>
                  </TabsTrigger>
                )}

                {config.troubleshooting &&
                  config.troubleshooting.length > 0 && (
                    <TabsTrigger
                      value="troubleshooting"
                      className="cursor-pointer gap-1.5 text-xs"
                    >
                      <AlertCircle className="size-3.5" />
                      <span>
                        Troubleshooting ({config.troubleshooting.length})
                      </span>
                    </TabsTrigger>
                  )}

                {config.simulatorSlot && (
                  <TabsTrigger
                    value="simulator"
                    className="cursor-pointer gap-1.5 text-xs"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Live Simulator</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Drawer Body Area */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {/* TAB 1: GUIDE & TOPICS */}
              <TabsContent value="guide" className="mt-0 h-full">
                <div className="grid h-full min-h-[380px] grid-cols-1 gap-6 md:grid-cols-12">
                  {/* Topic Selector Sidebar */}
                  <div className="space-y-1.5 overflow-y-auto border-b border-border pb-4 md:col-span-4 md:border-r md:border-b-0 md:pr-4 md:pb-0 lg:col-span-3">
                    <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      Topics
                    </div>
                    {filteredTopics.map((topic) => {
                      const IconComponent = topic.icon || FileText
                      const isSelected = selectedTopic?.id === topic.id
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => setUserSelectedTopicId(topic.id)}
                          className={`flex w-full cursor-pointer items-start gap-2.5 rounded-lg p-2.5 text-left transition-all ${
                            isSelected
                              ? "border border-primary/20 bg-primary/10 text-primary"
                              : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <IconComponent
                            className={`mt-0.5 size-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="block truncate text-xs font-semibold">
                                {topic.title}
                              </span>
                              {topic.badge && (
                                <Badge
                                  variant="outline"
                                  className="shrink-0 px-1 py-0 text-[9px] uppercase"
                                >
                                  {topic.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/80">
                              {topic.summary}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Topic Reading View */}
                  <div className="max-w-5xl space-y-4 overflow-y-auto pr-2 md:col-span-8 lg:col-span-9">
                    {selectedTopic ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold tracking-tight text-foreground">
                              {selectedTopic.title}
                            </h3>
                            {selectedTopic.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedTopic.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {selectedTopic.summary}
                          </p>
                        </div>

                        <div className="border-t border-border pt-4">
                          {selectedTopic.content}
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-muted-foreground">
                        No topics matched your search.
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: PLAYBOOKS */}
              <TabsContent value="playbooks" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Operational Playbooks
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Step-by-step verified configurations for common release
                      scenarios
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filteredPlaybooks.length} Recipes
                  </Badge>
                </div>

                <Accordion className="divide-y rounded-xl border border-border bg-card">
                  {filteredPlaybooks.map((playbook) => (
                    <AccordionItem
                      key={playbook.id}
                      value={playbook.id}
                      className="p-1"
                    >
                      <AccordionTrigger className="cursor-pointer px-4 py-3 hover:no-underline">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {playbook.title}
                            </span>
                            {playbook.badge && (
                              <Badge variant="outline" className="text-[10px]">
                                {playbook.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs font-normal text-muted-foreground">
                            <strong>Goal:</strong> {playbook.goal}
                          </p>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="space-y-3 px-4 pt-1 pb-4 text-xs">
                        <div>
                          <div className="mb-1 font-semibold text-foreground">
                            Configuration Setup:
                          </div>
                          <div className="rounded-lg bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground">
                            {playbook.configurationSummary}
                          </div>
                        </div>

                        <Alert className="border-primary/20 bg-primary/5 py-2">
                          <AlertTitle className="text-xs font-semibold text-primary">
                            Why It Works
                          </AlertTitle>
                          <AlertDescription className="text-xs text-muted-foreground">
                            {playbook.whyItWorks}
                          </AlertDescription>
                        </Alert>

                        {playbook.onApplyPreset && (
                          <div className="flex justify-end pt-2">
                            <Button
                              size="sm"
                              onClick={playbook.onApplyPreset}
                              className="cursor-pointer gap-1.5 text-xs font-semibold"
                            >
                              <Sparkles className="size-3.5" />
                              <span>
                                {playbook.actionLabel || "Apply This Preset"}
                              </span>
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredPlaybooks.length === 0 && (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No playbooks matched your search.
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: TROUBLESHOOTING */}
              <TabsContent value="troubleshooting" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Admin Troubleshooting Matrix
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Diagnose common symptoms, cache issues, and evaluation
                      surprises
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filteredTroubleshooting.length} Solutions
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3.5 pt-2 md:grid-cols-2">
                  {filteredTroubleshooting.map((item, idx) => (
                    <div
                      key={idx}
                      className="space-y-2.5 rounded-xl border border-border bg-card p-4 shadow-xs"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                        <div className="text-xs font-semibold text-foreground">
                          {item.problem}
                        </div>
                      </div>

                      <div className="space-y-2 pl-6 text-xs">
                        <div>
                          <strong className="text-muted-foreground">
                            Possible Cause:{" "}
                          </strong>
                          <span className="text-foreground">{item.cause}</span>
                        </div>
                        <Alert className="border-emerald-500/20 bg-emerald-500/5 py-2">
                          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          <AlertTitle className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                            Admin Fix
                          </AlertTitle>
                          <AlertDescription className="text-xs text-emerald-950/90 dark:text-emerald-200/90">
                            {item.solution}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  ))}

                  {filteredTroubleshooting.length === 0 && (
                    <div className="col-span-full py-12 text-center text-xs text-muted-foreground">
                      No troubleshooting records matched your search.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* TAB 4: SIMULATOR SLOT */}
              <TabsContent value="simulator" className="mt-0">
                <div className="mx-auto max-w-4xl space-y-4">
                  {config.simulatorSlot}
                </div>
              </TabsContent>
            </div>

            {/* Drawer Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-border bg-muted/20 px-6 py-3 text-xs text-muted-foreground">
              <span className="font-mono text-[11px]">
                {config.moduleName} Operations Reference
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer text-xs"
              >
                Close Guide
              </Button>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Tour Modal */}
      {config.tourSteps && (
        <HelpTourModal
          open={tourOpen}
          onOpenChange={setTourOpen}
          tourTitle={`${config.moduleName} Tour`}
          steps={config.tourSteps}
        />
      )}
    </>
  )
}

export default HelpDrawer
