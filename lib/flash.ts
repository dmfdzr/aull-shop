import { redirect } from "next/navigation"

export type FlashStatus = "success" | "error" | "info"

export type FlashSearchParams = Promise<
  | {
      status?: string
      message?: string
    }
  | undefined
>

export function flashUrl(path: string, status: FlashStatus, message: string) {
  const params = new URLSearchParams({
    status,
    message,
  })

  return `${path}?${params.toString()}`
}

export function redirectWithFlash(
  path: string,
  status: FlashStatus,
  message: string
): never {
  redirect(flashUrl(path, status, message))
}
