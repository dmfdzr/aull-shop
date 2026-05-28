import { createOrderAction } from "@/app/actions/orders"
import { AppAlert } from "@/components/app-alert"
import { BackLinkButton, SectionHeader } from "@/components/page-chrome"
import { Button } from "@/components/ui/button"
import { getCheckoutOptions } from "@/lib/catalog"
import { formatCurrency } from "@/lib/format"

export const dynamic = "force-dynamic"

type CheckoutPageProps = {
  searchParams: Promise<{
    status?: string
    message?: string
  }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const flash = await searchParams
  const options = await getCheckoutOptions()

  return (
    <main className="min-h-svh">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-12">
        <aside className="space-y-4">
          <BackLinkButton href="/">Kembali ke katalog</BackLinkButton>
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">Form pemesanan PO</p>
            <h1 className="text-3xl font-semibold md:text-5xl">
              Order merch dan amankan slot PO
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Isi data pemesan, pilih varian, lalu upload bukti DP. Setelah
              submit, kamu akan mendapatkan order code untuk cek status.
            </p>
          </div>
          <div className="app-surface p-4 text-sm leading-6 text-muted-foreground">
            File bukti pembayaran dibatasi maksimal 2 MB dengan format JPG,
            PNG, WebP, atau PDF supaya storage dan bandwidth tetap hemat.
          </div>
        </aside>

        <form
          action={createOrderAction}
          className="app-surface grid gap-5 p-5"
        >
          <AppAlert
            status={flash.status}
            message={flash.message}
          />
          <SectionHeader
            eyebrow="Customer order"
            title="Data pemesanan"
            description="Pastikan varian, jumlah, dan bukti DP sudah benar sebelum mengirim order."
            className="mb-0"
          />
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="customerName">
              Nama pemesan
            </label>
            <input
              required
              id="customerName"
              name="customerName"
              className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              placeholder="Nama sesuai chat/order"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="whatsapp">
                WhatsApp
              </label>
              <input
                required
                id="whatsapp"
                name="whatsapp"
                inputMode="tel"
                className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email opsional
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="variantId">
              Produk dan varian
            </label>
            <select
              required
              id="variantId"
              name="variantId"
              className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              <option value="">Pilih produk</option>
              {options.map((option) => (
                <option key={option.variantId} value={option.variantId}>
                  {option.batchName} - {option.productName} /{" "}
                  {option.variantLabel} ({formatCurrency(option.estimatedPrice)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="quantity">
                Jumlah
              </label>
              <input
                required
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                defaultValue="1"
                className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="dpAmount">
                Nominal DP
              </label>
              <input
                required
                id="dpAmount"
                name="dpAmount"
                type="number"
                min="1"
                className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="50000"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="address">
              Alamat opsional
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              placeholder="Alamat pengiriman final jika sudah ada"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="proofFile">
              Bukti DP
            </label>
            <input
              required
              id="proofFile"
              name="proofFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="min-h-11 rounded-md border bg-background px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="notes">
              Catatan opsional
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              placeholder="Request packing, catatan member, atau info tambahan"
            />
          </div>

          <Button type="submit" size="lg" disabled={options.length === 0}>
            Kirim order PO
          </Button>
        </form>
      </div>
    </main>
  )
}
