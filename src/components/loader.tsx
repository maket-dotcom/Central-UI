import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: number;
}

/**
 * Animated spinning loader icon for loading states and asynchronous operations.
 */
const Loader = ({ className, size = 20 }: LoaderProps) => {
  return (
    <Loader2
      size={size}
      className={cn("animate-spin text-muted-foreground", className)}
    />
  );
};

export default Loader;
