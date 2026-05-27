import { AdminShell } from "@/components/admin-shell"
import { StatusBadge } from "@/components/status-badge"
import { getProducts } from "@/lib/admin-data"
import { requireAdminUser } from "@/lib/auth"
import { formatCurrency } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  await requireAdminUser()
  const products = await getProducts()

  return (
    <AdminShell
      title="Katalog"
      description="Produk dan varian PO yang tampil untuk customer."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card p-8 text-sm text-muted-foreground">
            Belum ada produk. Setelah form CRUD dibuat, admin bisa menambahkan
            item merch, varian, harga estimasi, dan minimum DP di sini.
          </div>
        ) : (
          products.map((product) => (
            <article key={product.id} className="rounded-lg border bg-card p-4">
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
            </article>
          ))
        )}
      </section>
    </AdminShell>
  )
}
