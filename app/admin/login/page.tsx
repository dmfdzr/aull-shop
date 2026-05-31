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
    <main className="grid min-h-svh place-items-center overflow-x-hidden px-3.5 py-5 sm:px-5 sm:py-8">
      <form
        action={signInAdminAction}
        className="app-surface grid w-full max-w-sm gap-5 p-3.5 sm:p-5"
      >
        <AppAlert
          status={flash.status}
          message={flash.message}
        />
        <div>
          <p className="text-sm font-medium text-primary">Area admin</p>
          <h1 className="mt-1 text-2xl font-semibold">Login SKZ Mart</h1>
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
            className="app-field"
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
            className="app-field"
          />
        </div>

        <LoginSubmitButton />
        <Button asChild variant="ghost" className="w-full">
          <Link href="/">Kembali ke katalog</Link>
        </Button>
      </form>
    </main>
  )
}
