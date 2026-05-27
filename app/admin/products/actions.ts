"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdminUser } from "@/lib/auth"
import { assertDatabaseConfigured } from "@/lib/env"
import { redirectWithFlash } from "@/lib/flash"
import { prisma } from "@/lib/prisma"

const createProductSchema = z.object({
  batchId: z.string().uuid("Pilih batch PO."),
  name: z.string().min(3, "Nama produk minimal 3 karakter."),
  description: z.string().optional(),
  sourceCountry: z.string().optional(),
  sourceUrl: z.string().url("URL produk tidak valid.").optional().or(z.literal("")),
  estimatedPrice: z.coerce.number().positive("Harga estimasi wajib diisi."),
  minimumDp: z.coerce.number().positive("Minimum DP wajib diisi."),
  variants: z.string().min(1, "Minimal satu varian wajib diisi."),
})

function parseVariantLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, sku, quota] = line.split("|").map((part) => part?.trim())

      return {
        label,
        sku: sku || null,
        quota: quota ? Number(quota) : null,
      }
    })
    .filter((variant) => variant.label)
}

export async function createProductAction(formData: FormData) {
  await requireAdminUser()
  assertDatabaseConfigured()

  const parsed = createProductSchema.safeParse({
    batchId: formData.get("batchId"),
    name: formData.get("name"),
    description: formData.get("description"),
    sourceCountry: formData.get("sourceCountry"),
    sourceUrl: formData.get("sourceUrl"),
    estimatedPrice: formData.get("estimatedPrice"),
    minimumDp: formData.get("minimumDp"),
    variants: formData.get("variants"),
  })

  if (!parsed.success) {
    redirectWithFlash(
      "/admin/products",
      "error",
      parsed.error.issues[0]?.message ?? "Data produk tidak valid."
    )
  }

  const variants = parseVariantLines(parsed.data.variants)

  if (variants.length === 0) {
    redirectWithFlash("/admin/products", "error", "Minimal satu varian wajib diisi.")
  }

  if (variants.some((variant) => variant.quota !== null && Number.isNaN(variant.quota))) {
    redirectWithFlash("/admin/products", "error", "Format kuota varian tidak valid.")
  }

  try {
    await prisma.product.create({
      data: {
        batchId: parsed.data.batchId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        sourceCountry: parsed.data.sourceCountry || null,
        sourceUrl: parsed.data.sourceUrl || null,
        estimatedPrice: parsed.data.estimatedPrice,
        minimumDp: parsed.data.minimumDp,
        variants: {
          create: variants,
        },
      },
    })
  } catch {
    redirectWithFlash("/admin/products", "error", "Produk gagal disimpan.")
  }

  revalidatePath("/admin/products")
  revalidatePath("/")
  revalidatePath("/checkout")
  redirectWithFlash("/admin/products", "success", "Produk berhasil disimpan.")
}

const toggleProductSchema = z.object({
  id: z.string().uuid(),
  isActive: z.enum(["true", "false"]),
})

export async function toggleProductAction(formData: FormData) {
  await requireAdminUser()
  assertDatabaseConfigured()

  const parsed = toggleProductSchema.safeParse({
    id: formData.get("id"),
    isActive: formData.get("isActive"),
  })

  if (!parsed.success) {
    redirectWithFlash("/admin/products", "error", "Status produk tidak valid.")
  }

  try {
    await prisma.product.update({
      where: {
        id: parsed.data.id,
      },
      data: {
        isActive: parsed.data.isActive === "true",
      },
    })
  } catch {
    redirectWithFlash("/admin/products", "error", "Status produk gagal diupdate.")
  }

  revalidatePath("/admin/products")
  revalidatePath("/")
  revalidatePath("/checkout")
  redirectWithFlash("/admin/products", "success", "Status produk berhasil diupdate.")
}
