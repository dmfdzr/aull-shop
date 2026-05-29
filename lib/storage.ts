export const PROOF_BUCKET = "proofs"

export const ALLOWED_PROOF_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
])

export function validateProofFile(file: File) {
  if (!file || file.size === 0) {
    return "Bukti pembayaran wajib dikirim."
  }

  if (!ALLOWED_PROOF_MIME_TYPES.has(file.type)) {
    return "Format file harus JPG, PNG, WebP, atau PDF."
  }

  return null
}

export function buildProofPath(scope: string, file: File) {
  const extension =
    file.type === "image/webp"
      ? "webp"
      : file.name.split(".").pop()?.toLowerCase() ?? "bin"
  const safeScope = scope.replace(/[^a-zA-Z0-9-_]/g, "-")

  return `${safeScope}/${crypto.randomUUID()}.${extension}`
}
