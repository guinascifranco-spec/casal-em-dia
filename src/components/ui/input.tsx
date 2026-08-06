import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-border bg-input px-4 py-2 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 placeholder:text-muted-foreground/70 hover:border-primary/30 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
