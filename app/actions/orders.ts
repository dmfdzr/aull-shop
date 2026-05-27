"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createOrderCode } from "@/lib/order-code"
import { buildProofPath, PROOF_BUCKET, validateProofFile } from "@/lib/storage"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

const createOrderSchema = z.object({
  customerName: z.string().min(2, "Nama wajib diisi."),
  whatsapp: z.string().min(8, "Nomor WhatsApp tidak valid."),
  email: z.string().email("Email tidak valid.").optional().or(z.literal("")),
  address: z.string().optional(),
  variantId: z.string().uuid("Varian tidak valid."),
  quantity: z.coerce.number().int().min(1).max(99),
  dpAmount: z.coerce.number().positive("Nominal DP wajib diisi."),
  notes: z.string().optional(),
})

export async function createOrderAction(formData: FormData) {
  const proofFile = formData.get("proofFile")
  const parsed = createOrderSchema.safeParse({
    customerName: formData.get("customerName"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    address: formData.get("address"),
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
    dpAmount: formData.get("dpAmount"),
    notes: formData.get("notes"),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data order tidak valid.")
  }

  if (!(proofFile instanceof File)) {
    throw new Error("Bukti pembayaran wajib diupload.")
  }

  const proofError = validateProofFile(proofFile)

  if (proofError) {
    throw new Error(proofError)
  }

  const variant = await prisma.productVariant.findUnique({
    where: {
      id: parsed.data.variantId,
      isActive: true,
    },
    include: {
      product: {
        include: {
          batch: true,
        },
      },
    },
  })

  if (!variant || !variant.product.isActive) {
    throw new Error("Produk atau varian tidak tersedia.")
  }

  if (variant.product.batch.status !== "OPEN") {
    throw new Error("PO sudah ditutup untuk produk ini.")
  }

  if (variant.quota !== null && parsed.data.quantity > variant.quota) {
    throw new Error("Jumlah order melebihi kuota varian.")
  }

  const orderCode = createOrderCode()
  const unitPrice = Number(
    variant.priceOverride ??
      Number(variant.product.estimatedPrice) + Number(variant.priceAdjustment ?? 0)
  )
  const estimatedTotal = unitPrice * parsed.data.quantity
  const proofPath = buildProofPath(orderCode, proofFile)
  const supabase = createSupabaseAdminClient()
  const uploadResult = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(proofPath, proofFile, {
      contentType: proofFile.type,
      upsert: false,
    })

  if (uploadResult.error) {
    throw new Error("Upload bukti pembayaran gagal. Coba lagi.")
  }

  try {
    await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({
        where: {
          whatsapp: parsed.data.whatsapp,
        },
      })

      customer ??= await tx.customer.create({
        data: {
          name: parsed.data.customerName,
          whatsapp: parsed.data.whatsapp,
          email: parsed.data.email || null,
          address: parsed.data.address || null,
        },
      })

      await tx.order.create({
        data: {
          orderCode,
          customerId: customer.id,
          batchId: variant.product.batchId,
          estimatedTotal,
          dpTotal: parsed.data.dpAmount,
          notes: parsed.data.notes || null,
          paymentStatus: "DP_SUBMITTED",
          items: {
            create: {
              productId: variant.productId,
              variantId: variant.id,
              productNameSnapshot: variant.product.name,
              variantLabelSnapshot: variant.label,
              quantity: parsed.data.quantity,
              unitPriceSnapshot: unitPrice,
              subtotal: estimatedTotal,
            },
          },
          payments: {
            create: {
              type: "DP",
              amount: parsed.data.dpAmount,
              proofPath,
            },
          },
        },
      })
    })
  } catch (error) {
    await supabase.storage.from(PROOF_BUCKET).remove([proofPath])
    throw error
  }

  redirect(`/order/${orderCode}`)
}
