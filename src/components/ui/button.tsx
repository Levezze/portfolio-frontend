import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { transitionDurationAtom } from "@/atoms/atomStore"
import { cn } from "@/lib/utils"
import { pageColorAtom } from "@/atoms/atomStore"
import { useAtomValue } from "jotai"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-input bg-input/30 shadow-xs hover:bg-hover-header-color/40 hover:text-accent-foreground",
          // dark:bg-input/30 dark:border-input dark:hover:bg-input/100
        outline_pressed:
          "border-input bg-hover-header-color/40 shadow-xs hover:bg-input/30 hover:text-accent-foreground",
          // dark:bg-input/30 dark:border-input dark:hover:bg-input/50
        footer:
          "border-input bg-none hover:bg-input/30 hover:text-accent-foreground",
          // dark:bg-input/30 dark:border-input dark:hover:bg-input/50
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        // suggestions:
        //   "bg-primary hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
      matchBgColor: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "ghost",
        matchBgColor: true,
        class: "bg-[var(--dynamic-bg)] hover:bg-[var(--dynamic-bg)]/50 dark:hover:!bg-white/70 transition-colors ease-in-out",
      }
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  matchBgColor = false,
  colorTransition = "3000",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    matchBgColor?: boolean
    colorTransition?: string
  }) {
  const Comp = asChild ? Slot : "button";
  const transitionDuration = useAtomValue(transitionDurationAtom)
  const pageColor = useAtomValue(pageColorAtom);
  const bgColor = matchBgColor ? pageColor : undefined;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className, matchBgColor }))}
      style={
        matchBgColor ? { 
            '--dynamic-bg': bgColor,
            transitionDuration: `background-color ${transitionDuration}ms`
          } as React.CSSProperties : undefined
      }
      {...props}
    />
  )
}

export { Button, buttonVariants }
