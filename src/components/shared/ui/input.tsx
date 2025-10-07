import * as React from "react";

import { cn } from "@/lib/utils/general";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground font-inter placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-muted border rounded-[25px] flex h-9 w-full min-w-0 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-base file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "bg-muted px-1 pt-2 dark:border-muted-foreground/15",
        className
      )}
      {...props}
    />
  );
}

export { Input };
