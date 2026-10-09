# Phase 4: Shared & Input Components

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/components/inputComponents/`, `src/utils/`  
> **Requirements:** Interactive Code Editor Component & Client-side Column Sorting Support

---

## 1. Objective

Build reusable UI building blocks needed across the management suite:
1. An interactive **JSON Code Editor Component** featuring line numbers, real-time syntax checking, auto-formatting ("Prettify"), and error highlights.
2. A generic **Client-side Column Sorting** utility hook for tables (`Releases`, `Features`, `Testers`).

---

## 2. Task 1: Create `JsonEditorComponent`

**File:** `src/components/inputComponents/json-editor-component.tsx`

Provides a clean code-editing experience without requiring heavy external binary dependencies:

```typescript
import React, { useState, useEffect } from "react"
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
  const [syntaxError, setSyntaxError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof value === "object" && value !== null) {
      try {
        const currentParsed = JSON.parse(rawText)
        if (JSON.stringify(currentParsed) !== JSON.stringify(value)) {
          setRawText(JSON.stringify(value, null, 2))
        }
      } catch {
        // Keep raw text if current text has deliberate typing edits
      }
    }
  }, [value])

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
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setSyntaxError("JSON must be a valid key-value object {...}")
        return
      }
      setSyntaxError(null)
      onChange(parsed, text)
    } catch (err: any) {
      setSyntaxError(err.message || "Invalid JSON syntax")
    }
  }

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(rawText || "{}")
      const formatted = JSON.stringify(parsed, null, 2)
      setRawText(formatted)
      setSyntaxError(null)
      onChange(parsed, formatted)
    } catch (err: any) {
      setSyntaxError(err.message || "Cannot format invalid JSON")
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
            className="h-7 text-xs gap-1"
          >
            <Sparkles className="size-3.5 text-primary" />
            Prettify
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 text-xs gap-1"
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
          "relative flex rounded-md border bg-muted/20 font-mono text-xs overflow-hidden transition-colors focus-within:ring-1 focus-within:ring-ring",
          (syntaxError || error) ? "border-destructive focus-within:ring-destructive" : "border-input"
        )}
      >
        {/* Line numbers gutter */}
        <div className="select-none bg-muted/50 text-muted-foreground px-2.5 py-3 text-right border-r border-border leading-5">
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
          className="flex-1 resize-y bg-transparent p-3 leading-5 outline-none font-mono text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="{\n  \"key\": \"value\"\n}"
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
```

---

## 3. Task 2: Create Column Sorting Utility Hook

**File:** `src/hooks/useTableSort.ts`

Provides sorting state and helpers for React tables:

```typescript
import { useState, useMemo } from "react"

export type SortOrder = "asc" | "desc" | null

export interface SortConfig<T> {
  key: keyof T | null
  order: SortOrder
}

export function useTableSort<T>(items: T[], initialKey: keyof T | null = null, initialOrder: SortOrder = null) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialKey,
    order: initialOrder,
  })

  const requestSort = (key: keyof T) => {
    let order: SortOrder = "asc"
    if (sortConfig.key === key && sortConfig.order === "asc") {
      order = "desc"
    } else if (sortConfig.key === key && sortConfig.order === "desc") {
      order = null
    }
    setSortConfig({ key: order ? key : null, order })
  }

  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.order) {
      return items
    }

    return [...items].sort((a, b) => {
      const valA = a[sortConfig.key!]
      const valB = b[sortConfig.key!]

      if (valA === valB) return 0
      if (valA === undefined || valA === null) return 1
      if (valB === undefined || valB === null) return -1

      if (typeof valA === "number" && typeof valB === "number") {
        return sortConfig.order === "asc" ? valA - valB : valB - valA
      }

      const strA = String(valA).toLowerCase()
      const strB = String(valB).toLowerCase()
      return sortConfig.order === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA)
    })
  }, [items, sortConfig])

  return { sortedItems, sortConfig, requestSort }
}
```

---

## 4. Execution Checklist

- [x] 4.1 Create `src/components/inputComponents/json-editor-component.tsx` with gutter line numbering, formatting, and validation.
- [x] 4.2 Create `src/hooks/useTableSort.ts` for sortable table columns.
