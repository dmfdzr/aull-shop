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
  const featuredProducts = batches.flatMap((batch) =>
    batch.products.slice(0, 2).map((product) => ({
      ...product,
      batchName: batch.name,
    }))
  )

  return (
    <main className="min-h-svh">
      <section className="brand-hero relative overflow-hidden border-b border-border/70">
        <div className="app-shell-grid absolute inset-0 opacity-45" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 md:px-8 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl space-y-6">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="blue">K-pop merch PO</StatusBadge>
              <span className="app-chip">pantau PO lebih mudah</span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-6xl">
              SKZmart preorder hub yang lebih rapi, cepat, dan mudah dipantau.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Pesan merch, amankan slot PO, dan pantau progress order dari DP
              sampai checkout Shopee tanpa harus bongkar chat lama.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/checkout">Buat order PO</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/admin">Kelola toko</Link>
              </Button>
            </div>
            <div className="grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="app-stat-card">
                <p className="text-xs text-muted-foreground">Batch dibuka</p>
                <p className="mt-1 text-3xl font-semibold">{batches.length}</p>
              </div>
              <div className="app-stat-card">
                <p className="text-xs text-muted-foreground">Produk aktif</p>
                <p className="mt-1 text-3xl font-semibold">{productCount}</p>
              </div>
              <div className="app-stat-card col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground">Alur pesanan</p>
                <p className="mt-1 text-lg font-semibold">DP sampai Shopee</p>
              </div>
            </div>
          </div>

          <div className="app-surface app-panel-highlight p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">
                  Katalog aktif
                </p>
                <h2 className="text-xl font-semibold">Daftar PO</h2>
              </div>
              <StatusBadge tone={batches.length > 0 ? "green" : "neutral"}>
                {batches.length > 0 ? "Dibuka" : "Belum dibuka"}
              </StatusBadge>
            </div>
            <div className="grid gap-3">
              {(featuredProducts.length > 0 ? featuredProducts : []).map(
                (product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-border/65 bg-card/74 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {product.batchName}
                        </p>
                        <h3 className="mt-1 font-semibold">{product.name}</h3>
                      </div>
                      <StatusBadge tone="amber">
                        DP {formatCurrency(product.minimumDp)}
                      </StatusBadge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.variants.slice(0, 4).map((variant) => (
                        <span key={variant.id} className="app-chip min-h-7">
                          {variant.label}
                        </span>
                      ))}
                    </div>
                  </article>
                )
              )}
              {featuredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-card/64 p-6 text-sm leading-6 text-muted-foreground">
                  Belum ada katalog aktif. Saat batch PO dibuka, pemesan bisa
                  langsung melihat item dan mengirim order dari halaman ini.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">
              Active preorder
            </p>
            <h2 className="mt-1 text-2xl font-semibold md:text-3xl">
              PO aktif
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
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
                className="app-surface brand-accent-card p-4 md:p-5"
              >
                <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl font-semibold">{batch.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tutup PO:{" "}
                      {batch.closeAt
                        ? new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                          }).format(batch.closeAt)
                        : "Belum ditentukan"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone="green">Dibuka</StatusBadge>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/checkout">Pesan dari batch ini</Link>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {batch.products.map((product) => (
                    <article
                      key={product.id}
                      className="app-surface-soft p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35"
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
                        {product.description ?? "Merch PO dengan pilihan produk yang rapi."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => (
                          <span
                            key={variant.id}
                            className="app-chip min-h-7"
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
