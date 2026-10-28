import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn("relative h-3 w-full overflow-hidden rounded-full bg-secondary", className)}
    {...props}
  >
    {/* Breite statt translateX, damit der Balken in RTL automatisch von rechts wächst */}
    <ProgressPrimitive.Indicator
      className={cn("h-full rounded-full bg-primary transition-all duration-300", indicatorClassName)}
      style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
