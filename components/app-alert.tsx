"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type AppAlertProps = {
  status?: string
  message?: string
}

const modalCopy = {
  success: {
    title: "Berhasil disimpan",
    action: "Lanjut",
    marker: "✓",
  },
  error: {
    title: "Aksi belum berhasil",
    action: "Coba lagi",
    marker: "!",
  },
  info: {
    title: "Info",
    action: "Mengerti",
    marker: "i",
  },
} as const

export function AppAlert({ status, message }: AppAlertProps) {
  const router = useRouter()

  if (!message || !status || !(status in modalCopy)) {
    return null
  }

  const safeStatus = status as keyof typeof modalCopy
  const copy = modalCopy[safeStatus]

  function closeModal() {
    const nextUrl = new URL(window.location.href)
    nextUrl.searchParams.delete("status")
    nextUrl.searchParams.delete("message")
    router.replace(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`, {
      scroll: false,
    })
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-center bg-background/55 px-5 py-8 backdrop-blur-sm"
    >
      <div
        role={safeStatus === "error" ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="feedback-title"
        aria-describedby="feedback-message"
        className="app-surface w-full max-w-md p-5 text-center shadow-xl"
      >
        <div
          className={
            safeStatus === "error"
              ? "mx-auto mb-4 grid size-12 place-items-center rounded-full bg-rose-500/15 text-lg font-bold text-rose-600 dark:text-rose-300"
              : "mx-auto mb-4 grid size-12 place-items-center rounded-full bg-primary/15 text-lg font-bold text-primary"
          }
        >
          {copy.marker}
        </div>
        <h2 id="feedback-title" className="text-xl font-semibold">
          {copy.title}
        </h2>
        <p
          id="feedback-message"
          className="mt-2 text-sm leading-6 text-muted-foreground"
        >
          {message}
        </p>
        <div className="mt-5 flex justify-center">
          <Button type="button" onClick={closeModal}>
            {copy.action}
          </Button>
        </div>
      </div>
    </div>
  )
}
