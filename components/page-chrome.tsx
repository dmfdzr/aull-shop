import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BackLinkButtonProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export function BackLinkButton({
  href,
  children,
  className,
}: BackLinkButtonProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-2 min-h-9 rounded-full px-3 text-muted-foreground hover:bg-secondary hover:text-foreground",
        className
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  )
}

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex min-w-0 flex-col justify-between gap-3 md:flex-row md:items-start",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="grid shrink-0 gap-2 sm:flex sm:flex-wrap">{actions}</div>
      ) : null}
    </div>
  )
}

type ActionToolbarProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function ActionToolbar({
  title,
  description,
  children,
}: ActionToolbarProps) {
  return (
    <section className="app-surface mb-6 flex flex-col justify-between gap-4 p-3.5 sm:p-4 md:flex-row md:items-center md:p-5">
      <div className="min-w-0">
        <h2 className="font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-2 sm:flex sm:flex-wrap">{children}</div>
    </section>
  )
}
