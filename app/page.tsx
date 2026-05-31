import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import FloatingLines from "@/components/FloatingLines"
import { StatusBadge } from "@/components/status-badge"
import { getActiveCatalog } from "@/lib/catalog"
import { formatCurrency } from "@/lib/format"

export const dynamic = "force-dynamic"

const heroLineGradient = ["#70bdf2", "#b982f1", "#f5c66e"]
const heroEnabledWaves: Array<"middle" | "bottom"> = ["middle", "bottom"]
const heroLineCount = [8, 10]
const heroLineDistance = [7, 5]
const heroMiddleWavePosition = { x: 4.6, y: 0.05, rotate: 0.18 }
const heroBottomWavePosition = { x: 1.4, y: -0.72, rotate: -0.45 }

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
  const highlightedProducts = featuredProducts.slice(0, 3)

  return (
    <main className="min-h-svh overflow-x-hidden">
      <section className="brand-hero relative flex min-h-svh overflow-x-hidden">
        <div className="app-shell-grid absolute inset-0 opacity-45" />
        <div className="pointer-events-none absolute inset-0 w-full opacity-70 dark:opacity-55">
          <FloatingLines
            linesGradient={heroLineGradient}
            enabledWaves={heroEnabledWaves}
            lineCount={heroLineCount}
            lineDistance={heroLineDistance}
            middleWavePosition={heroMiddleWavePosition}
            bottomWavePosition={heroBottomWavePosition}
            animationSpeed={0.55}
            interactive={false}
            parallax={false}
            mixBlendMode="screen"
          />
        </div>
        <div className="relative mx-auto grid w-full max-w-7xl gap-6 self-start px-4 py-5 sm:px-5 sm:py-7 md:self-center md:px-8 md:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="min-w-0 max-w-3xl space-y-4 md:space-y-6">
            <div className="brand-lockup w-fit">
              <Image
                src="/assets/favicon.png"
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-xl object-cover"
              />
              <span>SKZ Mart</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="blue">K-pop merch PO</StatusBadge>
              <span className="app-chip">pantau PO lebih mudah</span>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-slate-950 dark:text-slate-950 sm:text-4xl md:text-5xl xl:text-6xl">
              SKZ Mart preorder hub yang lebih rapi, cepat, dan mudah dipantau.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-800 dark:text-slate-800 sm:text-base md:text-lg md:leading-7">
              Pesan merch, amankan slot PO, dan pantau progress order dari DP
              sampai checkout Shopee tanpa harus bongkar chat lama.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/checkout">Buat order PO</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
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

          <div className="app-surface app-panel-highlight min-w-0 p-3.5 sm:p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">
                  Ringkasan katalog
                </p>
                <h2 className="text-xl font-semibold">Item PO aktif</h2>
              </div>
              <StatusBadge tone={batches.length > 0 ? "green" : "neutral"}>
                {batches.length > 0 ? "Dibuka" : "Belum dibuka"}
              </StatusBadge>
            </div>
            <div className="grid gap-3">
              {(highlightedProducts.length > 0 ? highlightedProducts : []).map(
                (product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-border/65 bg-card/74 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {product.batchName}
                        </p>
                        <h3 className="mt-1 wrap-break-word font-semibold">
                          {product.name}
                        </h3>
                      </div>
                      <StatusBadge tone="amber" className="shrink-0">
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
              {highlightedProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-card/64 p-6 text-sm leading-6 text-muted-foreground">
                  Belum ada katalog aktif. Saat batch PO dibuka, pemesan bisa
                  langsung melihat item dan mengirim order dari halaman ini.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
