import Link from "next/link"
import { LogoutConfirmation } from "@/components/logout-confirmation"
import { Button } from "@/components/ui/button"
import { signOutAdminAction } from "@/app/admin/actions"

const navItems = [
  { href: "/admin", label: "Beranda" },
  { href: "/admin/batches", label: "PO Batch" },
  { href: "/admin/products", label: "Katalog" },
  { href: "/admin/orders", label: "Daftar order" },
]

type AdminShellProps = {
  children: React.ReactNode
  title: string
  description?: string
}

export function AdminShell({ children, title, description }: AdminShellProps) {
  return (
    <main className="min-h-svh">
      <header className="app-header sticky top-0 z-30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <Link href="/admin" className="app-chip text-primary">
              SKZmart Ops
            </Link>
            <h1 className="mt-3 text-2xl font-semibold md:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <nav className="flex flex-wrap gap-2 md:justify-end">
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="outline" size="sm">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <LogoutConfirmation action={signOutAdminAction} />
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8 md:py-8">
        {children}
      </div>
    </main>
  )
}
