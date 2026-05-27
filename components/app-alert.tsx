import { StatusBadge } from "@/components/status-badge"
import { cn } from "@/lib/utils"

const alertStyles = {
  success:
    "border-cyan-200 bg-cyan-50 text-cyan-950 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-100",
  error:
    "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100",
  info: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100",
} as const

const badgeTone = {
  success: "green",
  error: "red",
  info: "blue",
} as const

type AppAlertProps = {
  status?: string
  message?: string
  className?: string
}

export function AppAlert({ status, message, className }: AppAlertProps) {
  if (!message || !status || !(status in alertStyles)) {
    return null
  }

  const safeStatus = status as keyof typeof alertStyles

  return (
    <div
      role={safeStatus === "error" ? "alert" : "status"}
      className={cn(
        "mb-5 flex flex-col gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm md:flex-row md:items-center md:justify-between",
        alertStyles[safeStatus],
        className
      )}
    >
      <p className="leading-6">{message}</p>
      <StatusBadge tone={badgeTone[safeStatus]}>
        {safeStatus === "success"
          ? "Berhasil"
          : safeStatus === "error"
            ? "Gagal"
            : "Info"}
      </StatusBadge>
    </div>
  )
}
