import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signOutAdminAction } from "@/app/admin/actions"

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/batches", label: "PO Batch" },
  { href: "/admin/products", label: "Katalog" },
  { href: "/admin/orders", label: "Masterlist" },
]

type AdminShellProps = {
  children: React.ReactNode
  title: string
  description?: string
}

export function AdminShell({ children, title, description }: AdminShellProps) {
  return (
    <main className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-primary">
              Aull Shop Ops
            </Link>
            <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="outline" size="sm">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <form action={signOutAdminAction}>
              <Button type="submit" variant="ghost" size="sm">
                Logout
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8">
        {children}
      </div>
    </main>
  )
}
