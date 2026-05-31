"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ProofFileInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "onChange"
> & {
  hint?: string
}

const TARGET_MAX_BYTES = 360 * 1024
const MAX_DIMENSION = 1280
const MIN_QUALITY = 0.42

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")

  if (!context) {
    return file
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let quality = 0.72
  let compressed = await canvasToFile(canvas, file.name, quality)

  while (compressed.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - 0.1)
    compressed = await canvasToFile(canvas, file.name, quality)
  }

  return compressed.size < file.size ? compressed : file
}

function canvasToFile(canvas: HTMLCanvasElement, fileName: string, quality: number) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal mengompres gambar."))
          return
        }

        const safeName = fileName.replace(/\.[^.]+$/, "") || "proof"
        resolve(
          new File([blob], `${safeName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          })
        )
      },
      "image/webp",
      quality
    )
  })
}

export function ProofFileInput({
  className,
  hint = "Gambar akan diperkecil otomatis sebelum dikirim. PDF tetap diterima apa adanya.",
  ...props
}: ProofFileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [message, setMessage] = React.useState(hint)
  const [isCompressing, setIsCompressing] = React.useState(false)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      setMessage(hint)
      return
    }

    if (!file.type.startsWith("image/")) {
      setMessage("PDF diterima apa adanya. Untuk ukuran paling kecil, kirim gambar bukti bayar.")
      return
    }

    setIsCompressing(true)
    setMessage("Memperkecil gambar sebelum dikirim...")

    try {
      const compressed = await compressImage(file)
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(compressed)

      if (inputRef.current) {
        inputRef.current.files = dataTransfer.files
      }

      const originalKb = Math.ceil(file.size / 1024)
      const compressedKb = Math.ceil(compressed.size / 1024)
      setMessage(
        compressed.size < file.size
          ? `Dikompres dari ${originalKb} KB ke ${compressedKb} KB.`
          : `Ukuran file ${originalKb} KB sudah cukup efisien.`
      )
    } catch {
      setMessage("Gambar gagal diperkecil otomatis, file asli tetap akan dikirim.")
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className={cn(
          "app-field py-2 text-xs file:mr-2 file:rounded-xl file:border-0 file:bg-primary file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground sm:text-sm sm:file:mr-3 sm:file:px-3 sm:file:text-sm",
          className
        )}
        onChange={handleChange}
        {...props}
      />
      <p className="text-xs leading-5 text-muted-foreground" aria-live="polite">
        {isCompressing ? "Memperkecil gambar..." : message}
      </p>
    </div>
  )
}
