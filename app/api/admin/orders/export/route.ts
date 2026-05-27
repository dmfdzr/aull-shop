import { NextRequest } from "next/server"
import * as XLSX from "xlsx"
import { requireAdminUser } from "@/lib/auth"
import { assertDatabaseConfigured } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  await requireAdminUser()
  assertDatabaseConfigured()

  const format = request.nextUrl.searchParams.get("format") ?? "csv"
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      batch: true,
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const rows = orders.map((order) => ({
    orderCode: order.orderCode,
    customerName: order.customer.name,
    whatsapp: order.customer.whatsapp,
    batch: order.batch.name,
    itemCount: order.items.length,
    estimatedTotal: order.estimatedTotal.toString(),
    dpTotal: order.dpTotal.toString(),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    shipmentStatus: order.shipmentStatus,
    createdAt: order.createdAt.toISOString(),
  }))

  if (format === "xlsx") {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Masterlist")
    const buffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    }) as ArrayBuffer

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=aull-shop-masterlist.xlsx",
      },
    })
  }

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(worksheet)

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=aull-shop-masterlist.csv",
    },
  })
}
