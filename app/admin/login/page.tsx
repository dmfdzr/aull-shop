import Link from "next/link"
import { signInAdminAction } from "@/app/admin/login/actions"
import { Button } from "@/components/ui/button"

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-muted/30 px-5 py-8">
      <form
        action={signInAdminAction}
        className="grid w-full max-w-sm gap-5 rounded-lg border bg-card p-5"
      >
        <div>
          <p className="text-sm font-medium text-primary">Admin area</p>
          <h1 className="mt-1 text-2xl font-semibold">Login Aull Shop</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk untuk mengelola PO batch, katalog, masterlist, pembayaran,
            dan shipment.
          </p>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            required
            id="email"
            name="email"
            type="email"
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            required
            id="password"
            name="password"
            type="password"
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </div>

        <Button type="submit" size="lg">
          Masuk
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Kembali ke katalog</Link>
        </Button>
      </form>
    </main>
  )
}
