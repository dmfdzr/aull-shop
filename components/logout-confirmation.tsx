"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"

type LogoutConfirmationProps = {
  action: () => Promise<void>
}

export function LogoutConfirmation({ action }: LogoutConfirmationProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const portalRoot = typeof document === "undefined" ? null : document.body

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  const dialog =
    isOpen && portalRoot
      ? createPortal(
          <div
            className="fixed inset-0 z-[1000] grid place-items-center bg-background/70 px-5 py-8 backdrop-blur-md"
            onMouseDown={() => setIsOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              aria-describedby="logout-description"
              className="app-surface w-full max-w-md p-5 shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
                ?
              </div>
              <div className="text-center">
                <h2 id="logout-title" className="text-xl font-semibold">
                  Keluar dari dashboard?
                </h2>
                <p
                  id="logout-description"
                  className="mt-2 text-sm leading-6 text-muted-foreground"
                >
                  Kamu perlu login lagi untuk mengelola order, katalog, dan
                  status pembayaran.
                </p>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Batal
                </Button>
                <form action={action}>
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                  >
                    Ya, logout
                  </Button>
                </form>
              </div>
            </div>
          </div>,
          portalRoot
        )
      : null

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        Logout
      </Button>
      {dialog}
    </>
  )
}
