import type * as React from "react";

import { cn } from "@/lib/utils/general";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "font-inter placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-muted flex field-sizing-content min-h-16 w-full rounded-[25px] border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
        "bg-muted px-1 pt-2 dark:border-muted-foreground/15 shadow-inner shadow-black/50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
