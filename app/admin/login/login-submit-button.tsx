"use client"

import { createPortal, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"

export function LoginSubmitButton() {
  const { pending } = useFormStatus()
  const portalRoot = typeof document === "undefined" ? null : document.body
  const dialog =
    pending && portalRoot
      ? createPortal(
          <div className="fixed inset-0 z-[1000] grid place-items-center bg-background/70 px-3.5 py-5 backdrop-blur-md sm:px-5 sm:py-8">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="login-pending-title"
              aria-describedby="login-pending-description"
              className="app-surface w-full max-w-sm p-4 text-center shadow-2xl sm:p-6"
            >
              <div className="mx-auto mb-5 grid size-14 place-items-center rounded-full bg-primary/15">
                <span className="size-7 animate-spin rounded-full border-3 border-primary/25 border-t-primary" />
              </div>
              <h2 id="login-pending-title" className="text-xl font-semibold">
                Mengarahkan ke dashboard
              </h2>
              <p
                id="login-pending-description"
                className="mt-2 text-sm leading-6 text-muted-foreground"
              >
                Sedang memeriksa akun admin dan menyiapkan beranda SKZ Mart.
              </p>
            </div>
          </div>,
          portalRoot
        )
      : null

  return (
    <>
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Mengarahkan..." : "Masuk dashboard admin"}
      </Button>
      {dialog}
    </>
  )
}
