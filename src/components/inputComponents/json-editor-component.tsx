import React, { useState } from "react"
import { Check, Copy, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface JsonEditorComponentProps {
  id?: string
  label?: string
  value: Record<string, unknown> | string
  onChange: (parsedValue: Record<string, unknown>, rawString: string) => void
  disabled?: boolean
  error?: string
  minHeight?: string
}

export const JsonEditorComponent: React.FC<JsonEditorComponentProps> = ({
  id,
  label = "JSON Payload",
  value,
  onChange,
  disabled = false,
  error,
  minHeight = "220px",
}) => {
  const [rawText, setRawText] = useState<string>(() => {
    if (typeof value === "string") return value
    return JSON.stringify(value || {}, null, 2)
  })
  const [prevValueStr, setPrevValueStr] = useState<string>(() =>
    typeof value === "string" ? value : JSON.stringify(value || {})
  )
  const [syntaxError, setSyntaxError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const currentValueStr =
    typeof value === "string" ? value : JSON.stringify(value || {})

  if (currentValueStr !== prevValueStr) {
    setPrevValueStr(currentValueStr)
    try {
      const currentParsed = JSON.parse(rawText)
      if (JSON.stringify(currentParsed) !== currentValueStr) {
        setRawText(
          typeof value === "string" ? value : JSON.stringify(value, null, 2)
        )
      }
    } catch {
      // Keep raw text if current text has deliberate typing edits
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setRawText(text)

    if (!text.trim()) {
      setSyntaxError(null)
      onChange({}, text)
      return
    }

    try {
      const parsed = JSON.parse(text)
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        setSyntaxError("JSON must be a valid key-value object {...}")
        return
      }
      setSyntaxError(null)
      onChange(parsed, text)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid JSON syntax"
      setSyntaxError(message)
    }
  }

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(rawText || "{}")
      const formatted = JSON.stringify(parsed, null, 2)
      setRawText(formatted)
      setSyntaxError(null)
      onChange(parsed, formatted)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Cannot format invalid JSON"
      setSyntaxError(message)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Compute line numbers
  const lines = rawText.split("\n").length

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrettify}
            disabled={disabled}
            className="h-7 cursor-pointer gap-1 text-xs"
          >
            <Sparkles className="size-3.5 text-primary" />
            Prettify
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 cursor-pointer gap-1 text-xs"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "relative flex overflow-hidden rounded-md border bg-muted/20 font-mono text-xs transition-colors focus-within:ring-1 focus-within:ring-ring",
          syntaxError || error
            ? "border-destructive focus-within:ring-destructive"
            : "border-input"
        )}
      >
        {/* Line numbers gutter */}
        <div className="border-r border-border bg-muted/50 px-2.5 py-3 text-right leading-5 text-muted-foreground select-none">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Text editor area */}
        <textarea
          id={id}
          value={rawText}
          onChange={handleTextChange}
          disabled={disabled}
          spellCheck={false}
          style={{ minHeight }}
          className="flex-1 resize-y bg-transparent p-3 font-mono leading-5 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={'{\n  "key": "value"\n}'}
        />
      </div>

      {/* Syntax Error Notice */}
      {(syntaxError || error) && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{syntaxError || error}</span>
        </div>
      )}
    </div>
  )
}

export default JsonEditorComponent
