import { useState, useMemo } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
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

interface SelectOption {
  name: string;
  value: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  placeholder?: string;
  title?: string;
  ariaInvalid?: boolean;
  className?: string;
  size?: "sm" | "default";
  errorTooltip?: string;
  tooltip?: string;
  onValueChange?: (value: string) => void;
  value?: string;
  data?: SelectOption[];
  search?: boolean;
  disabled?: boolean;
}

/**
 * Flexible Select dropdown supporting either native select menu or searchable combobox popover.
 */
const SelectComponent = ({
  id,
  name,
  placeholder,
  title,
  ariaInvalid = false,
  className,
  size = "default",
  errorTooltip,
  tooltip,
  onValueChange,
  value,
  data = [],
  search = false,
  disabled = false,
}: SelectProps) => {
  const [open, setOpen] = useState(false);

  // Searchable combobox variant
  if (search) {
    const selectedOption = data.find((d) => d.value === value);

    const triggerButton = (
      <button
        type="button"
        id={id}
        role="combobox"
        disabled={disabled}
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
          size === "sm" ? "h-8" : "h-9",
          ariaInvalid && "!border-destructive",
          className
        )}
      >
        <span className="line-clamp-1 flex-1 text-left flex items-center gap-2">
          {selectedOption ? (
            selectedOption.name
          ) : (
            <span className="text-muted-foreground">{placeholder || "Select"}</span>
          )}
        </span>
        <ChevronDownIcon className="size-4 opacity-50 shrink-0" />
      </button>
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger render={<PopoverTrigger render={triggerButton} />} />
          {(errorTooltip || tooltip) && (
            <TooltipContent
              className={errorTooltip ? "bg-destructive font-semibold text-destructive-foreground" : ""}
            >
              <p>{errorTooltip || tooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>

        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder={title || "Search ..."} />
            <CommandList>
              <CommandEmpty>Not found</CommandEmpty>
              <CommandGroup>
                {data.map((d, index) => (
                  <CommandItem
                    key={`${d.value}-${index}`}
                    value={d.value}
                    keywords={[d.name]}
                    onSelect={() => {
                      onValueChange?.(d.value);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size-4",
                        value === d.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {d.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Prepare items structure for Base UI Select so it recognizes labels
  const baseItems = useMemo(() => {
    return data.map((d) => ({ value: d.value, label: d.name }));
  }, [data]);

  // Standard select dropdown variant
  const triggerElement = (
    <SelectTrigger
      id={id}
      aria-invalid={ariaInvalid}
      className={cn("cursor-pointer w-full", className)}
      size={size}
    >
      <SelectValue placeholder={placeholder || "Select"}>
        {(val) => {
          const selectedOption = data.find((d) => d.value === val);
          return selectedOption
            ? selectedOption.name
            : (val || placeholder || "Select");
        }}
      </SelectValue>
    </SelectTrigger>
  );

  return (
    <Select
      name={name}
      items={baseItems}
      disabled={disabled}
      onValueChange={(val) => {
        if (typeof val === "string") onValueChange?.(val);
      }}
      value={value}
    >
      <Tooltip>
        <TooltipTrigger render={triggerElement} />
        {(errorTooltip || tooltip) && (
          <TooltipContent
            className={errorTooltip ? "bg-destructive font-semibold text-destructive-foreground" : ""}
          >
            <p>{errorTooltip || tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>

      <SelectContent>
        <SelectGroup>
          {title && <SelectLabel>{title}</SelectLabel>}
          {data.map((d, index) => (
            <SelectItem
              key={`${d.value}-${index}`}
              value={d.value}
              label={d.name}
              className="cursor-pointer"
            >
              {d.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectComponent;
