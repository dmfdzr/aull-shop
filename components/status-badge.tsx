import { cn } from "@/lib/utils"

const toneStyles = {
  neutral: "border-border bg-muted text-muted-foreground",
  blue: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  amber:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  red: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
} as const

type StatusBadgeProps = {
  children: React.ReactNode
  tone?: keyof typeof toneStyles
  className?: string
}

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-medium",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
