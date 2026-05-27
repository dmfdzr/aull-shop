"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdminUser } from "@/lib/auth"
import { assertDatabaseConfigured } from "@/lib/env"
import { prisma } from "@/lib/prisma"

const verifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  paymentId: z.string().uuid(),
  status: z.enum(["VERIFIED", "REJECTED"]),
  rejectionReason: z.string().optional(),
})

export async function verifyPaymentAction(formData: FormData) {
  await requireAdminUser()
  assertDatabaseConfigured()
  const parsed = verifyPaymentSchema.safeParse({
    orderId: formData.get("orderId"),
    paymentId: formData.get("paymentId"),
    status: formData.get("status"),
    rejectionReason: formData.get("rejectionReason"),
  })

  if (!parsed.success) {
    throw new Error("Data verifikasi pembayaran tidak valid.")
  }

  const payment = await prisma.payment.update({
    where: {
      id: parsed.data.paymentId,
    },
    data: {
      verificationStatus: parsed.data.status,
      rejectionReason:
        parsed.data.status === "REJECTED"
          ? parsed.data.rejectionReason || "Bukti pembayaran ditolak."
          : null,
      verifiedAt: new Date(),
    },
  })

  const nextPaymentStatus =
    parsed.data.status === "REJECTED"
      ? "REJECTED"
      : payment.type === "FINAL"
        ? "PAID"
        : "DP_VERIFIED"

  await prisma.order.update({
    where: {
      id: parsed.data.orderId,
    },
    data: {
      paymentStatus: nextPaymentStatus,
      orderStatus: payment.type === "DP" ? "CONFIRMED" : undefined,
    },
  })

  revalidatePath(`/admin/orders/${parsed.data.orderId}`)
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
}

const shipmentEventSchema = z.object({
  orderId: z.string().uuid(),
  stage: z.enum([
    "ORDERED_TO_SOURCE",
    "TO_OVERSEAS_WAREHOUSE",
    "AT_OVERSEAS_WAREHOUSE",
    "TO_INDONESIA_WAREHOUSE",
    "AT_INDONESIA_WAREHOUSE",
    "TO_JOGJA",
    "AT_JOGJA",
    "SHOPEE_CHECKOUT_PENDING",
    "FINAL_DELIVERY",
    "DELIVERED",
  ]),
  location: z.string().optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

export async function addShipmentEventAction(formData: FormData) {
  await requireAdminUser()
  assertDatabaseConfigured()
  const parsed = shipmentEventSchema.safeParse({
    orderId: formData.get("orderId"),
    stage: formData.get("stage"),
    location: formData.get("location"),
    trackingNumber: formData.get("trackingNumber"),
    notes: formData.get("notes"),
  })

  if (!parsed.success) {
    throw new Error("Data shipment tidak valid.")
  }

  await prisma.$transaction([
    prisma.shipmentEvent.create({
      data: {
        orderId: parsed.data.orderId,
        stage: parsed.data.stage,
        location: parsed.data.location || null,
        trackingNumber: parsed.data.trackingNumber || null,
        notes: parsed.data.notes || null,
        eventAt: new Date(),
      },
    }),
    prisma.order.update({
      where: {
        id: parsed.data.orderId,
      },
      data: {
        shipmentStatus: parsed.data.stage,
        orderStatus:
          parsed.data.stage === "ORDERED_TO_SOURCE"
            ? "ORDERED_TO_SOURCE"
            : parsed.data.stage === "SHOPEE_CHECKOUT_PENDING"
              ? "READY_FOR_SHOPEE"
              : parsed.data.stage === "DELIVERED"
                ? "COMPLETED"
                : undefined,
      },
    }),
  ])

  revalidatePath(`/admin/orders/${parsed.data.orderId}`)
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
}

const shopeeInstructionSchema = z.object({
  orderId: z.string().uuid(),
  instructionText: z.string().min(5),
  instructionUrl: z.string().url().optional().or(z.literal("")),
})

export async function upsertShopeeInstructionAction(formData: FormData) {
  await requireAdminUser()
  assertDatabaseConfigured()
  const parsed = shopeeInstructionSchema.safeParse({
    orderId: formData.get("orderId"),
    instructionText: formData.get("instructionText"),
    instructionUrl: formData.get("instructionUrl"),
  })

  if (!parsed.success) {
    throw new Error("Instruksi Shopee tidak valid.")
  }

  await prisma.$transaction([
    prisma.shopeeCheckout.upsert({
      where: {
        orderId: parsed.data.orderId,
      },
      update: {
        instructionText: parsed.data.instructionText,
        instructionUrl: parsed.data.instructionUrl || null,
      },
      create: {
        orderId: parsed.data.orderId,
        instructionText: parsed.data.instructionText,
        instructionUrl: parsed.data.instructionUrl || null,
      },
    }),
    prisma.order.update({
      where: {
        id: parsed.data.orderId,
      },
      data: {
        orderStatus: "READY_FOR_SHOPEE",
        shipmentStatus: "SHOPEE_CHECKOUT_PENDING",
      },
    }),
  ])

  revalidatePath(`/admin/orders/${parsed.data.orderId}`)
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
}
