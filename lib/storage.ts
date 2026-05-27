export const PROOF_BUCKET = "proofs"
export const MAX_PROOF_FILE_SIZE = 2 * 1024 * 1024

export const ALLOWED_PROOF_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
])

export function validateProofFile(file: File) {
  if (!file || file.size === 0) {
    return "Bukti pembayaran wajib diupload."
  }

  if (file.size > MAX_PROOF_FILE_SIZE) {
    return "Ukuran file maksimal 2 MB."
  }

  if (!ALLOWED_PROOF_MIME_TYPES.has(file.type)) {
    return "Format file harus JPG, PNG, WebP, atau PDF."
  }

  return null
}

export function buildProofPath(scope: string, file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin"
  const safeScope = scope.replace(/[^a-zA-Z0-9-_]/g, "-")

  return `${safeScope}/${crypto.randomUUID()}.${extension}`
}
