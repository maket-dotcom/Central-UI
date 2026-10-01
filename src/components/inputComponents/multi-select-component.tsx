import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  id?: string;
  placeholder?: string;
  title?: string;
  ariaInvalid?: boolean;
  className?: string;
  errorTooltip?: string;
  tooltip?: string;
  onValuesChange?: (value: string[]) => void;
  values?: string[];
  data?: Array<{ name: string; value: string }>;
  disabled?: boolean;
}

/**
 * Multi-selection dropdown input supporting search, pill badges, and tooltip feedback.
 */
const MultiSelectComponent = ({
  id,
  placeholder,
  title,
  ariaInvalid = false,
  className,
  errorTooltip,
  tooltip,
  onValuesChange,
  values,
  data,
  disabled,
}: MultiSelectProps) => {
  const triggerElement = (
    <MultiSelectTrigger
      id={id}
      ariaInvalid={ariaInvalid}
      disabled={disabled}
      className={cn("w-full", className)}
    >
      <MultiSelectValue placeholder={placeholder || "Select"} />
    </MultiSelectTrigger>
  );

  return (
    <MultiSelect
      onValuesChange={(val: string[]) => {
        if (onValuesChange) onValuesChange(val);
      }}
      values={values}
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

      <MultiSelectContent
        search={{
          placeholder: title || "Search ...",
          emptyMessage: "Not found",
        }}
      >
        {data?.map((d, index) => (
          <MultiSelectItem key={`${d.value}-${index}`} value={d.value}>
            {d.name}
          </MultiSelectItem>
        ))}
      </MultiSelectContent>
    </MultiSelect>
  );
};

export default MultiSelectComponent;
