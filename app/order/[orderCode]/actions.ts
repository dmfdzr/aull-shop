"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertDatabaseConfigured } from "@/lib/env"
import { redirectWithFlash } from "@/lib/flash"
import { buildProofPath, PROOF_BUCKET, validateProofFile } from "@/lib/storage"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

const finalPaymentSchema = z.object({
  orderCode: z.string().min(1),
  amount: z.coerce.number().positive(),
})

export async function submitFinalPaymentAction(formData: FormData) {
  assertDatabaseConfigured()

  const proofFile = formData.get("proofFile")
  const parsed = finalPaymentSchema.safeParse({
    orderCode: formData.get("orderCode"),
    amount: formData.get("amount"),
  })

  if (!parsed.success) {
    redirectWithFlash(
      `/order/${formData.get("orderCode") ?? ""}`,
      "error",
      "Data pelunasan tidak valid."
    )
  }

  if (!(proofFile instanceof File)) {
    redirectWithFlash(
      `/order/${parsed.data.orderCode}`,
      "error",
      "Bukti pelunasan wajib diupload."
    )
  }

  const proofError = validateProofFile(proofFile)

  if (proofError) {
    redirectWithFlash(`/order/${parsed.data.orderCode}`, "error", proofError)
  }

  const order = await prisma.order.findUnique({
    where: {
      orderCode: parsed.data.orderCode,
    },
  })

  if (!order) {
    redirectWithFlash(`/order/${parsed.data.orderCode}`, "error", "Order tidak ditemukan.")
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
    redirectWithFlash(
      `/order/${order.orderCode}`,
      "error",
      "Upload bukti pelunasan gagal."
    )
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
  } catch {
    await supabase.storage.from(PROOF_BUCKET).remove([proofPath])
    redirectWithFlash(
      `/order/${order.orderCode}`,
      "error",
      "Bukti pelunasan gagal disimpan."
    )
  }

  revalidatePath(`/order/${order.orderCode}`)
  redirectWithFlash(
    `/order/${order.orderCode}`,
    "success",
    "Bukti pelunasan berhasil dikirim."
  )
}

const shopeeProofSchema = z.object({
  orderCode: z.string().min(1),
  customerInvoiceUrl: z.string().url().optional().or(z.literal("")),
})

export async function submitShopeeCheckoutProofAction(formData: FormData) {
  assertDatabaseConfigured()

  const proofFile = formData.get("proofFile")
  const parsed = shopeeProofSchema.safeParse({
    orderCode: formData.get("orderCode"),
    customerInvoiceUrl: formData.get("customerInvoiceUrl"),
  })

  if (!parsed.success) {
    redirectWithFlash(
      `/order/${formData.get("orderCode") ?? ""}`,
      "error",
      "Data checkout Shopee tidak valid."
    )
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
    redirectWithFlash(
      `/order/${parsed.data.orderCode}`,
      "error",
      "Instruksi checkout Shopee belum tersedia."
    )
  }

  let proofPath: string | null = null

  if (proofFile instanceof File && proofFile.size > 0) {
    const proofError = validateProofFile(proofFile)

    if (proofError) {
      redirectWithFlash(`/order/${order.orderCode}`, "error", proofError)
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
      redirectWithFlash(
        `/order/${order.orderCode}`,
        "error",
        "Upload bukti checkout Shopee gagal."
      )
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
  redirectWithFlash(
    `/order/${order.orderCode}`,
    "success",
    "Bukti checkout Shopee berhasil dikirim."
  )
}
