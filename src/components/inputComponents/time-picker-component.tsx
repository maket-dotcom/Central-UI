"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TimePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  id?: string;
  name?: string;
  value?: string; // "HH:mm" format (e.g. "10:00")
  onChange?: (value: string) => void;
  ariaInvalid?: boolean;
  className?: string;
  errorTooltip?: string;
  tooltip?: string;
  step?: string | number;
}

/**
 * Native time input styled as a sleek shadcn control with native dialog invocation on click.
 */
export function TimePickerComponent({
  id,
  name,
  value = "10:00",
  onChange,
  ariaInvalid = false,
  className,
  errorTooltip,
  tooltip,
  step = "60",
  disabled,
  ...props
}: TimePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Invoke native browser picker if supported
  const handleClick = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      // Fallback silently if showPicker is unsupported
    }
  };

  const inputElement = (
    <Input
      ref={inputRef}
      id={id}
      name={name}
      type="time"
      step={step}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onClick={handleClick}
      className={cn(
        "w-full h-9 font-mono text-sm cursor-pointer bg-background",
        "appearance-none",
        "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
        "[color-scheme:light] dark:[color-scheme:dark]",
        ariaInvalid && "!border-destructive focus-visible:ring-destructive",
        className
      )}
      aria-invalid={ariaInvalid}
      {...props}
    />
  );

  if (!errorTooltip && !tooltip) {
    return inputElement;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={inputElement} />
      <TooltipContent
        className={errorTooltip ? "bg-destructive font-semibold text-destructive-foreground" : ""}
      >
        <p>{errorTooltip || tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default TimePickerComponent;
