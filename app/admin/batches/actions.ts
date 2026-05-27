"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAdminUser } from "@/lib/auth"
import { assertDatabaseConfigured } from "@/lib/env"
import { prisma } from "@/lib/prisma"

const createBatchSchema = z.object({
  name: z.string().min(3, "Nama batch minimal 3 karakter."),
  description: z.string().optional(),
  sourceCountry: z.string().optional(),
  openAt: z.string().optional(),
  closeAt: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]),
})

function parseDateInput(value?: string) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

export async function createBatchAction(formData: FormData) {
  await requireAdminUser()
  assertDatabaseConfigured()

  const parsed = createBatchSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    sourceCountry: formData.get("sourceCountry"),
    openAt: formData.get("openAt"),
    closeAt: formData.get("closeAt"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data batch tidak valid.")
  }

  await prisma.poBatch.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      sourceCountry: parsed.data.sourceCountry || null,
      openAt: parseDateInput(parsed.data.openAt),
      closeAt: parseDateInput(parsed.data.closeAt),
      status: parsed.data.status,
    },
  })

  revalidatePath("/admin/batches")
  revalidatePath("/admin/products")
  revalidatePath("/")
  revalidatePath("/checkout")
}

const updateBatchStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "ORDERED", "COMPLETED"]),
})

export async function updateBatchStatusAction(formData: FormData) {
  await requireAdminUser()
  assertDatabaseConfigured()

  const parsed = updateBatchStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    throw new Error("Status batch tidak valid.")
  }

  await prisma.poBatch.update({
    where: {
      id: parsed.data.id,
    },
    data: {
      status: parsed.data.status,
    },
  })

  revalidatePath("/admin/batches")
  revalidatePath("/admin/products")
  revalidatePath("/")
  revalidatePath("/checkout")
}
