import Link from "next/link"
import Image from "next/image"
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
    <main className="min-h-svh overflow-x-hidden">
      <header className="app-header sticky top-0 z-30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3.5 py-4 sm:px-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="min-w-0">
            <Link href="/admin" className="brand-lockup">
              <Image
                src="/assets/favicon.png"
                alt=""
                width={36}
                height={36}
                className="size-9 rounded-xl object-cover"
              />
              <span>SKZ Mart Admin</span>
            </Link>
            <h1 className="mt-3 break-words text-2xl font-semibold md:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap md:justify-end">
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="outline" size="sm">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <LogoutConfirmation action={signOutAdminAction} />
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-3.5 py-5 sm:px-5 md:px-8 md:py-8">
        {children}
      </div>
    </main>
  )
}
