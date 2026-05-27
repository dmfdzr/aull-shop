"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { buildProofPath, PROOF_BUCKET, validateProofFile } from "@/lib/storage"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

const finalPaymentSchema = z.object({
  orderCode: z.string().min(1),
  amount: z.coerce.number().positive(),
})

export async function submitFinalPaymentAction(formData: FormData) {
  const proofFile = formData.get("proofFile")
  const parsed = finalPaymentSchema.safeParse({
    orderCode: formData.get("orderCode"),
    amount: formData.get("amount"),
  })

  if (!parsed.success) {
    throw new Error("Data pelunasan tidak valid.")
  }

  if (!(proofFile instanceof File)) {
    throw new Error("Bukti pelunasan wajib diupload.")
  }

  const proofError = validateProofFile(proofFile)

  if (proofError) {
    throw new Error(proofError)
  }

  const order = await prisma.order.findUnique({
    where: {
      orderCode: parsed.data.orderCode,
    },
  })

  if (!order) {
    throw new Error("Order tidak ditemukan.")
  }

  const proofPath = buildProofPath(`${order.orderCode}-final`, proofFile)
  const supabase = createSupabaseAdminClient()
  const uploadResult = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(proofPath, proofFile, {
      contentType: proofFile.type,
      upsert: false,
    })

  if (uploadResult.error) {
    throw new Error("Upload bukti pelunasan gagal.")
  }

  try {
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          orderId: order.id,
          type: "FINAL",
          amount: parsed.data.amount,
          proofPath,
        },
      }),
      prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: "FINAL_SUBMITTED",
        },
      }),
    ])
  } catch (error) {
    await supabase.storage.from(PROOF_BUCKET).remove([proofPath])
    throw error
  }

  revalidatePath(`/order/${order.orderCode}`)
}

const shopeeProofSchema = z.object({
  orderCode: z.string().min(1),
  customerInvoiceUrl: z.string().url().optional().or(z.literal("")),
})

export async function submitShopeeCheckoutProofAction(formData: FormData) {
  const proofFile = formData.get("proofFile")
  const parsed = shopeeProofSchema.safeParse({
    orderCode: formData.get("orderCode"),
    customerInvoiceUrl: formData.get("customerInvoiceUrl"),
  })

  if (!parsed.success) {
    throw new Error("Data checkout Shopee tidak valid.")
  }

  const order = await prisma.order.findUnique({
    where: {
      orderCode: parsed.data.orderCode,
    },
    include: {
      shopeeCheckout: true,
    },
  })

  if (!order || !order.shopeeCheckout) {
    throw new Error("Instruksi checkout Shopee belum tersedia.")
  }

  let proofPath: string | null = null

  if (proofFile instanceof File && proofFile.size > 0) {
    const proofError = validateProofFile(proofFile)

    if (proofError) {
      throw new Error(proofError)
    }

    proofPath = buildProofPath(`${order.orderCode}-shopee`, proofFile)
    const supabase = createSupabaseAdminClient()
    const uploadResult = await supabase.storage
      .from(PROOF_BUCKET)
      .upload(proofPath, proofFile, {
        contentType: proofFile.type,
        upsert: false,
      })

    if (uploadResult.error) {
      throw new Error("Upload bukti checkout Shopee gagal.")
    }
  }

  await prisma.shopeeCheckout.update({
    where: {
      orderId: order.id,
    },
    data: {
      customerInvoiceUrl: parsed.data.customerInvoiceUrl || null,
      customerProofPath: proofPath,
      verificationStatus: "PENDING",
    },
  })

  revalidatePath(`/order/${order.orderCode}`)
}
