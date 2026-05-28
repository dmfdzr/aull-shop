import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { getActiveCatalog } from "@/lib/catalog"
import { formatCurrency } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function Page() {
  const batches = await getActiveCatalog()
  const productCount = batches.reduce(
    (total, batch) => total + batch.products.length,
    0
  )

  return (
    <main className="min-h-svh">
      <section className="brand-hero border-b border-border/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 md:px-8 md:py-14">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="blue">K-pop merch PO</StatusBadge>
              <span className="brand-chip">friendly preorder space</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
              SKZmart pre-order hub
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Tempat pesan merch K-pop yang lebih rapi, cerah, dan gampang
              dipantau dari DP sampai checkout Shopee.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/checkout">Buat order PO</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin">Kelola toko</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-semibold">PO aktif</h2>
            <p className="text-sm text-muted-foreground">
              Batch yang masih terbuka untuk pemesanan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <StatusBadge tone={batches.length > 0 ? "green" : "neutral"}>
              {batches.length} batch open
            </StatusBadge>
            <StatusBadge tone={productCount > 0 ? "blue" : "neutral"}>
              {productCount} produk tersedia
            </StatusBadge>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="app-surface-soft border-dashed p-8 text-sm text-muted-foreground">
            Belum ada PO aktif saat ini. Cek kembali nanti untuk batch merch
            terbaru dari SKZmart.
          </div>
        ) : (
          <div className="grid gap-5">
            {batches.map((batch) => (
              <section
                key={batch.id}
                className="app-surface brand-accent-card p-4"
              >
                <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{batch.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Tutup PO:{" "}
                      {batch.closeAt
                        ? new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                          }).format(batch.closeAt)
                        : "Belum ditentukan"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="green">OPEN</StatusBadge>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/checkout">Pesan dari batch ini</Link>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {batch.products.map((product) => (
                    <article
                      key={product.id}
                      className="app-surface-soft p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.sourceCountry ?? "Korea/Japan/China"}
                          </p>
                        </div>
                        <StatusBadge tone="amber">
                          DP {formatCurrency(product.minimumDp)}
                        </StatusBadge>
                      </div>
                      <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                        {product.description ?? "Merch PO dengan varian terstruktur."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => (
                          <span
                            key={variant.id}
                            className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            {variant.label}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
