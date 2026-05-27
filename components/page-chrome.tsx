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
        "-ml-2 h-9 gap-2 rounded-full px-3 text-muted-foreground hover:bg-secondary hover:text-foreground",
        className
      )}
    >
      <Link href={href}>
        <span aria-hidden="true" className="text-base leading-none">
          ←
        </span>
        <span>{children}</span>
      </Link>
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
        "mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-start",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
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
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
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
    <section className="app-surface mb-5 flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  )
}
