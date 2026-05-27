import { prisma } from "@/lib/prisma"

export async function getActiveCatalog() {
  try {
    return await prisma.poBatch.findMany({
      where: {
        status: "OPEN",
        products: {
          some: {
            isActive: true,
            variants: {
              some: {
                isActive: true,
              },
            },
          },
        },
      },
      include: {
        products: {
          where: {
            isActive: true,
          },
          include: {
            variants: {
              where: {
                isActive: true,
              },
              orderBy: {
                label: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        closeAt: "asc",
      },
    })
  } catch {
    return []
  }
}

export async function getCheckoutOptions() {
  const batches = await getActiveCatalog()

  return batches.flatMap((batch) =>
    batch.products.flatMap((product) =>
      product.variants.map((variant) => ({
        batchId: batch.id,
        batchName: batch.name,
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantLabel: variant.label,
        estimatedPrice: variant.priceOverride ?? product.estimatedPrice,
        minimumDp: product.minimumDp,
      }))
    )
  )
}
