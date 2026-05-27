import { prisma } from "@/lib/prisma"
import { isDatabaseConfigured } from "@/lib/env"

export async function getAdminDashboardStats() {
  if (!isDatabaseConfigured()) {
    return {
      activeBatches: 0,
      pendingDpVerification: 0,
      waitingFinalPayment: 0,
      shipmentsInProgress: 0,
      shopeePending: 0,
    }
  }

  try {
    const [
      activeBatches,
      pendingDpVerification,
      waitingFinalPayment,
      shipmentsInProgress,
      shopeePending,
    ] = await Promise.all([
      prisma.poBatch.count({ where: { status: "OPEN" } }),
      prisma.payment.count({ where: { type: "DP", verificationStatus: "PENDING" } }),
      prisma.order.count({ where: { paymentStatus: "WAITING_FINAL_PAYMENT" } }),
      prisma.order.count({
        where: {
          shipmentStatus: {
            notIn: ["NOT_STARTED", "DELIVERED"],
          },
        },
      }),
      prisma.shopeeCheckout.count({
        where: {
          verificationStatus: "PENDING",
        },
      }),
    ])

    return {
      activeBatches,
      pendingDpVerification,
      waitingFinalPayment,
      shipmentsInProgress,
      shopeePending,
    }
  } catch {
    return {
      activeBatches: 0,
      pendingDpVerification: 0,
      waitingFinalPayment: 0,
      shipmentsInProgress: 0,
      shopeePending: 0,
    }
  }
}

export async function getRecentOrders() {
  if (!isDatabaseConfigured()) {
    return []
  }

  try {
    return await prisma.order.findMany({
      include: {
        customer: true,
        batch: true,
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 25,
    })
  } catch {
    return []
  }
}

export async function getBatches() {
  if (!isDatabaseConfigured()) {
    return []
  }

  try {
    return await prisma.poBatch.findMany({
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch {
    return []
  }
}

export async function getProducts() {
  if (!isDatabaseConfigured()) {
    return []
  }

  try {
    return await prisma.product.findMany({
      include: {
        batch: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })
  } catch {
    return []
  }
}
