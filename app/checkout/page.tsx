import { createOrderAction } from "@/app/actions/orders"
import { AppAlert } from "@/components/app-alert"
import { BackLinkButton, SectionHeader } from "@/components/page-chrome"
import { ProofFileInput } from "@/components/proof-file-input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 md:px-8 md:py-12 lg:grid-cols-[0.86fr_1.14fr]">
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <BackLinkButton href="/">Kembali ke katalog</BackLinkButton>
          <div className="app-surface app-panel-highlight p-5 md:p-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase text-primary">
                Form pemesanan PO
              </p>
              <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
                Order merch dan amankan slot PO.
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Isi data pemesan, pilih produk, lalu kirim bukti DP. Setelah
                dikirim, kamu akan mendapatkan kode order untuk cek status.
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                "Data pemesan",
                "Produk dan jumlah",
                "Bukti DP",
                "Kode order otomatis",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl border border-border/65 bg-card/72 p-3"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="app-surface-soft p-4 text-sm leading-6 text-muted-foreground">
            <p className="font-medium text-foreground">Kirim bukti</p>
            <p className="mt-1">
              Kirim gambar atau PDF. Gambar akan diperkecil otomatis sebelum
              dikirim agar tidak memakan banyak ruang penyimpanan.
            </p>
          </div>
        </aside>

        <form
          action={createOrderAction}
          className="app-surface grid gap-5 p-4 md:p-6"
        >
          <AppAlert
            status={flash.status}
            message={flash.message}
          />
          <SectionHeader
            eyebrow="Pesanan pemesan"
            title="Data pemesanan"
            description="Pastikan pilihan produk, jumlah, dan bukti DP sudah benar sebelum mengirim order."
            className="mb-0"
          />

          <section className="app-form-section grid gap-4">
            <div>
              <h2 className="font-semibold">Pemesan</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Kontak utama untuk kabar pembayaran dan pengiriman.
              </p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="customerName">
                Nama pemesan
              </label>
              <input
                required
                id="customerName"
                name="customerName"
                className="app-field"
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
                  className="app-field"
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
                  className="app-field"
                  placeholder="nama@email.com"
                />
              </div>
            </div>
          </section>

          <section className="app-form-section grid gap-4">
            <div>
              <h2 className="font-semibold">Item PO</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pilih produk yang benar sebelum mengirim bukti DP.
              </p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="variantId">
                Produk dan pilihan
              </label>
              <Select name="variantId" required>
                <SelectTrigger id="variantId">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.variantId} value={option.variantId}>
                      {option.batchName} - {option.productName} /{" "}
                      {option.variantLabel} (
                      {formatCurrency(option.estimatedPrice)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  className="app-field"
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
                  className="app-field"
                  placeholder="50000"
                />
              </div>
            </div>
          </section>

          <section className="app-form-section grid gap-4">
            <div>
              <h2 className="font-semibold">Pembayaran dan catatan</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Kirim bukti DP dan detail tambahan untuk admin.
              </p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="proofFile">
                Bukti DP
              </label>
              <ProofFileInput
                required
                id="proofFile"
                name="proofFile"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="address">
                Alamat opsional
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                className="app-field min-h-24 py-3"
                placeholder="Alamat pengiriman final jika sudah ada"
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
                className="app-field min-h-24 py-3"
                placeholder="Permintaan packing, catatan member, atau info tambahan"
              />
            </div>
          </section>

          <Button type="submit" size="lg" disabled={options.length === 0}>
            Kirim order PO
          </Button>
        </form>
      </div>
    </main>
  )
}
