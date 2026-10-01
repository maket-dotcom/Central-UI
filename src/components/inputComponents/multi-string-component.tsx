import { PlusIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MultiStringProps {
  id?: string;
  label?: string;
  ariaInvalid?: boolean;
  errorTooltip?: string;
  disabled?: boolean;
  emptyNotAllowed?: boolean;
  emptyNotAllowedTooltip?: string;
  data: string[];
  setData: (value: string[]) => void;
}

/**
 * Dynamic list of string input fields allowing users to add, update, and remove string items.
 */
const MultiStringComponent = ({
  id,
  label = "Add",
  ariaInvalid = false,
  errorTooltip,
  disabled = false,
  emptyNotAllowed = false,
  emptyNotAllowedTooltip = "Should not be empty",
  data = [],
  setData,
}: MultiStringProps) => {
  // Append a new empty string input row
  const addField = () => {
    setData([...data, ""]);
  };

  // Update string value at specific index
  const updateField = (index: number, value: string) => {
    const newData = [...data];
    newData[index] = value;
    setData(newData);
  };

  // Remove string field row at specific index
  const removeField = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  return (
    <div className="grid gap-3">
      <div className="relative flex items-center justify-between">
        <Label
          htmlFor={disabled ? "" : id}
          className={disabled ? "text-muted-foreground" : ""}
        >
          {label}
        </Label>

        <Button
          id={id}
          variant="ghost"
          className="absolute right-0 cursor-pointer"
          onClick={addField}
          type="button"
          tooltip="Add More"
          disabled={disabled}
        >
          <PlusIcon className="size-5" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((value, index) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <Input
              placeholder="Enter value"
              value={value}
              onChange={(e) => updateField(index, e.target.value)}
              aria-invalid={
                emptyNotAllowed && data.length > 1
                  ? value.trim() === ""
                  : ariaInvalid
              }
              errorTooltip={
                emptyNotAllowed && data.length > 1
                  ? value.trim() === ""
                    ? emptyNotAllowedTooltip
                    : ""
                  : errorTooltip
              }
              disabled={disabled}
            />

            <Button
              variant="ghost"
              className="text-destructive rounded-full cursor-pointer"
              onClick={() => removeField(index)}
              type="button"
              tooltip="Remove"
              disabled={disabled}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiStringComponent;
