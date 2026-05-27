import { AdminShell } from "@/components/admin-shell"
import { AppAlert } from "@/components/app-alert"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { getBatches, getProducts } from "@/lib/admin-data"
import { requireAdminUser } from "@/lib/auth"
import { formatCurrency } from "@/lib/format"
import { createProductAction, toggleProductAction } from "./actions"

export const dynamic = "force-dynamic"

type AdminProductsPageProps = {
  searchParams: Promise<{
    status?: string
    message?: string
  }>
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requireAdminUser()
  const flash = await searchParams
  const [products, batches] = await Promise.all([getProducts(), getBatches()])

  return (
    <AdminShell
      title="Katalog"
      description="Produk dan varian PO yang tampil untuk customer."
    >
      <AppAlert status={flash.status} message={flash.message} />
      <section className="app-surface mb-6 p-5">
        <div className="mb-4">
          <h2 className="font-semibold">Tambah produk</h2>
          <p className="text-sm text-muted-foreground">
            Varian ditulis satu per baris. Format opsional:{" "}
            <span className="font-mono">Nama varian | SKU | Kuota</span>.
          </p>
        </div>
        <form action={createProductAction} className="grid gap-4 lg:grid-cols-6">
          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            Batch
            <select
              required
              name="batchId"
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Pilih batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.status})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            Nama produk
            <input
              required
              name="name"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="Album / Lightstick / Photocard"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Negara
            <input
              name="sourceCountry"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="Korea"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Estimasi harga
            <input
              required
              name="estimatedPrice"
              type="number"
              min="1"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="250000"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Minimum DP
            <input
              required
              name="minimumDp"
              type="number"
              min="1"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="50000"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium lg:col-span-5">
            Source URL
            <input
              name="sourceUrl"
              type="url"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="https://..."
            />
          </label>
          <label className="grid gap-2 text-sm font-medium lg:col-span-3">
            Deskripsi
            <textarea
              name="description"
              rows={5}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Info item, benefit PO, atau catatan versi."
            />
          </label>
          <label className="grid gap-2 text-sm font-medium lg:col-span-3">
            Varian
            <textarea
              required
              name="variants"
              rows={5}
              className="rounded-md border bg-background px-3 py-2 font-mono text-sm"
              placeholder={"Standard Version | STD | 20\nLimited Version | LTD | 10\nRandom Member"}
            />
          </label>
          <div className="lg:col-span-6">
            <Button type="submit" disabled={batches.length === 0}>
              Tambah produk ke katalog
            </Button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <div className="app-surface-soft border-dashed p-8 text-sm text-muted-foreground">
            Belum ada produk. Setelah form CRUD dibuat, admin bisa menambahkan
            item merch, varian, harga estimasi, dan minimum DP di sini.
          </div>
        ) : (
          products.map((product) => (
            <article
              key={product.id}
              className="app-surface p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {product.batch.name}
                  </p>
                </div>
                <StatusBadge tone={product.isActive ? "green" : "neutral"}>
                  {product.isActive ? "Aktif" : "Nonaktif"}
                </StatusBadge>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Estimasi</p>
                  <p className="font-medium">
                    {formatCurrency(product.estimatedPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Minimum DP</p>
                  <p className="font-medium">
                    {formatCurrency(product.minimumDp)}
                  </p>
                </div>
              </div>
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
              <form action={toggleProductAction} className="mt-4">
                <input type="hidden" name="id" value={product.id} />
                <input
                  type="hidden"
                  name="isActive"
                  value={product.isActive ? "false" : "true"}
                />
                <Button type="submit" variant="outline" size="sm">
                  {product.isActive ? "Sembunyikan produk" : "Tampilkan produk"}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Produk tersembunyi tidak muncul di katalog customer.
                </p>
              </form>
            </article>
          ))
        )}
      </section>
    </AdminShell>
  )
}
