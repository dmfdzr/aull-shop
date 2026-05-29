import Link from "next/link"
import { signInAdminAction } from "@/app/admin/login/actions"
import { AppAlert } from "@/components/app-alert"
import { Button } from "@/components/ui/button"
import { LoginSubmitButton } from "./login-submit-button"

type AdminLoginPageProps = {
  searchParams: Promise<{
    status?: string
    message?: string
  }>
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const flash = await searchParams

  return (
    <main className="grid min-h-svh place-items-center px-5 py-8">
      <form
        action={signInAdminAction}
        className="app-surface grid w-full max-w-sm gap-5 p-5"
      >
        <AppAlert
          status={flash.status}
          message={flash.message}
        />
        <div>
          <p className="text-sm font-medium text-primary">Area admin</p>
          <h1 className="mt-1 text-2xl font-semibold">Login SKZmart</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk untuk mengelola PO batch, katalog, daftar order, pembayaran,
            dan pengiriman.
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

        <LoginSubmitButton />
        <Button asChild variant="ghost">
          <Link href="/">Kembali ke katalog</Link>
        </Button>
      </form>
    </main>
  )
}
