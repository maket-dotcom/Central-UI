"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ImageSelectProps {
  id?: string;
  name?: string;
  placeholder?: string;
  title?: string;
  ariaInvalid?: boolean;
  className?: string;
  errorTooltip?: string;
  tooltip?: string;
  onValueChange?: (value: string) => void;
  value?: string;
  data?: Array<{ name: string; media: string }>;
}

/**
 * Image selection input with searchable popover list and thumbnail previews.
 */
export default function ImageSelectComponent({
  id,
  name,
  placeholder,
  title,
  ariaInvalid = false,
  className,
  errorTooltip,
  tooltip,
  onValueChange,
  value,
  data = [],
}: ImageSelectProps) {
  const [open, setOpen] = useState(false);

  // Find currently selected image item
  const selected = data.find((item) => item.media === value);

  const triggerButton = (
    <Button
      name={name}
      id={id}
      variant="outline"
      role="combobox"
      className={cn(
        "cursor-pointer w-full justify-start border-input",
        ariaInvalid && "!border-destructive",
        className
      )}
      aria-invalid={ariaInvalid}
    >
      <div className="flex w-full justify-between items-center">
        {selected ? (
          <div className="flex flex-row justify-start items-center gap-3">
            <img
              src={selected.media}
              alt={selected.name}
              className="w-6 h-6 rounded shrink-0 object-cover"
            />
            <span className="truncate">{selected.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 justify-self-end" />
      </div>
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger render={triggerButton} />
          }
        />

        {(errorTooltip || tooltip) && (
          <TooltipContent
            className={errorTooltip ? "bg-destructive font-semibold text-destructive-foreground" : ""}
          >
            <p>{errorTooltip || tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>

      <PopoverContent className="w-72 p-0">
        <Command>
          <CommandInput placeholder={title || "Search..."} />
          <CommandList>
            <CommandEmpty>No results found</CommandEmpty>

            {data.map((d) => (
              <CommandItem
                key={d.media}
                value={d.name}
                onSelect={() => {
                  onValueChange?.(d.media);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={d.media}
                    alt={d.name}
                    className="w-8 h-8 shrink-0 rounded object-cover"
                  />
                  <span>{d.name}</span>
                </div>

                {value === d.media && <Check className="ml-auto h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
