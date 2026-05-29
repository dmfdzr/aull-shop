import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap shadow-[0_12px_28px_color-mix(in_oklch,var(--primary),transparent_86%)] transition-all duration-300 ease-out outline-none select-none before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(110deg,transparent,color-mix(in_oklch,var(--primary-foreground),transparent_72%),transparent)] before:opacity-70 before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_color-mix(in_oklch,var(--primary),transparent_78%)] hover:before:translate-x-full focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:translate-y-0 disabled:scale-100 disabled:opacity-50 disabled:shadow-none disabled:before:hidden aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&>*]:relative [&>*]:z-10 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--primary),color-mix(in_oklch,var(--primary),var(--accent)_34%),color-mix(in_oklch,var(--primary),var(--chart-2)_18%))] text-primary-foreground hover:saturate-125",
        outline:
          "border-border/80 bg-card/76 text-foreground shadow-[0_10px_26px_color-mix(in_oklch,var(--foreground),transparent_94%)] backdrop-blur hover:border-primary/45 hover:bg-secondary hover:text-foreground hover:shadow-[0_16px_36px_color-mix(in_oklch,var(--primary),transparent_88%)] aria-expanded:bg-secondary aria-expanded:text-foreground dark:bg-card/60 dark:hover:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_10px_24px_color-mix(in_oklch,var(--secondary-foreground),transparent_92%)] hover:bg-[color-mix(in_oklch,var(--secondary),var(--primary)_14%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "shadow-none before:hidden hover:bg-secondary hover:text-foreground hover:shadow-none aria-expanded:bg-secondary aria-expanded:text-foreground dark:hover:bg-secondary/80",
        destructive:
          "bg-destructive text-white shadow-[0_10px_24px_color-mix(in_oklch,var(--destructive),transparent_82%)] hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:text-white dark:focus-visible:ring-destructive/40",
        link: "h-auto rounded-md px-0 text-primary shadow-none before:hidden underline-offset-4 hover:translate-y-0 hover:underline hover:shadow-none",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xs: "h-8 gap-1.5 px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-12 gap-2.5 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
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
