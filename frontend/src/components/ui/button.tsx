import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ledger-green focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 cursor-pointer select-none font-body",
  {
    variants: {
      variant: {
        default:
          "bg-ledger-green text-paper shadow-xs hover:bg-ledger-green/90 active:translate-y-[1px]",
        outline:
          "border border-hairline bg-paper hover:bg-paper-dark hover:text-ink text-ink shadow-xs",
        secondary:
          "bg-paper-dark text-ink hover:bg-hairline/60 active:translate-y-[1px]",
        ghost:
          "text-slate hover:text-ink hover:bg-hairline/40",
        destructive:
          "bg-red-600 text-white shadow-xs hover:bg-red-700",
        link:
          "text-slate underline-offset-4 hover:text-ink hover:underline p-0 h-auto font-normal",
        amber:
          "bg-seal-amber text-paper shadow-xs hover:bg-seal-amber/90 active:translate-y-[1px]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base font-medium",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

