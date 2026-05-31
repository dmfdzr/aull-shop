import { notFound } from "next/navigation"
import { AdminShell } from "@/components/admin-shell"
import { AppAlert } from "@/components/app-alert"
import { BackLinkButton, SectionHeader } from "@/components/page-chrome"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { requireAdminUser } from "@/lib/auth"
import { isDatabaseConfigured } from "@/lib/env"
import { formatCurrency, paymentStatusLabel, shipmentStatusLabel } from "@/lib/format"
import { prisma } from "@/lib/prisma"
import {
  addShipmentEventAction,
  upsertShopeeInstructionAction,
  verifyPaymentAction,
} from "./actions"

export const dynamic = "force-dynamic"

type AdminOrderDetailPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    status?: string
    message?: string
  }>
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: AdminOrderDetailPageProps) {
  await requireAdminUser()
  const { id } = await params
  const flash = await searchParams

  if (!isDatabaseConfigured()) {
    notFound()
  }

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      batch: true,
      items: true,
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
      shipmentEvents: {
        orderBy: {
          eventAt: "desc",
        },
      },
      shopeeCheckout: true,
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <AdminShell
      title={order.orderCode}
      description="Detail order, pembayaran, riwayat pengiriman, dan checkout Shopee."
    >
      <AppAlert status={flash.status} message={flash.message} />
      <div className="mb-4">
        <BackLinkButton href="/admin/orders">
          Kembali ke masterlist order
        </BackLinkButton>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5">
          <div className="app-surface p-3.5 sm:p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              <StatusBadge tone="amber">
                {paymentStatusLabel[order.paymentStatus]}
              </StatusBadge>
              <StatusBadge tone="blue">
                {shipmentStatusLabel[order.shipmentStatus]}
              </StatusBadge>
            </div>
            <dl className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Pemesan</dt>
                <dd className="font-medium">{order.customer.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="font-medium">{order.customer.whatsapp}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Batch</dt>
                <dd className="font-medium">{order.batch.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estimasi total</dt>
                <dd className="font-medium">
                  {formatCurrency(order.estimatedTotal)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="app-surface p-3.5 sm:p-5">
            <SectionHeader
              title="Item order"
              description="Barang yang dipilih pemesan saat membuat order."
            />
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 border-b pb-3 last:border-0 last:pb-0 sm:flex sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium">{item.productNameSnapshot}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.variantLabelSnapshot} x {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium sm:text-right">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="app-surface p-3.5 sm:p-5">
            <SectionHeader
              title="Riwayat pengiriman"
              description="Riwayat pergerakan barang untuk order ini."
            />
            {order.shipmentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada kabar pengiriman.
              </p>
            ) : (
              <div className="space-y-3">
                {order.shipmentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-md border bg-background p-3"
                  >
                    <p className="font-medium">{shipmentStatusLabel[event.stage]}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location ?? "Lokasi belum diisi"} -{" "}
                      {new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                      }).format(event.eventAt)}
                    </p>
                    {event.trackingNumber ? (
                      <p className="text-sm text-muted-foreground">
                        Resi: {event.trackingNumber}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="min-w-0 space-y-5">
          <div className="app-surface p-3.5 sm:p-5">
            <SectionHeader
              title="Verifikasi pembayaran"
              description="Cek bukti DP atau pelunasan sebelum mengubah status."
            />
            <div className="space-y-3">
              {order.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-md border bg-background p-3 text-sm"
                >
                  <div className="grid gap-2 sm:flex sm:justify-between sm:gap-3">
                    <span className="font-medium">{payment.type}</span>
                    <StatusBadge
                      tone={
                        payment.verificationStatus === "VERIFIED"
                          ? "green"
                          : payment.verificationStatus === "REJECTED"
                            ? "red"
                            : "amber"
                      }
                    >
                      {payment.verificationStatus}
                    </StatusBadge>
                  </div>
                  <p className="text-muted-foreground">
                    {formatCurrency(payment.amount)}
                  </p>
                  {payment.verificationStatus === "PENDING" ? (
                    <form action={verifyPaymentAction} className="mt-3 grid gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <div className="grid gap-2">
                        <label
                          className="text-xs font-medium"
                          htmlFor={`status-${payment.id}`}
                        >
                          Verifikasi
                        </label>
                        <Select name="status" defaultValue="VERIFIED">
                          <SelectTrigger
                            id={`status-${payment.id}`}
                            className="min-h-9"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VERIFIED">Terima</SelectItem>
                            <SelectItem value="REJECTED">Tolak</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <input
                        name="rejectionReason"
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        placeholder="Alasan reject opsional"
                      />
                      <Button type="submit" size="sm" className="w-full sm:w-auto">
                        Simpan hasil verifikasi
                      </Button>
                    </form>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <form
            action={addShipmentEventAction}
            className="app-surface grid gap-3 p-3.5 sm:p-5"
          >
            <SectionHeader
              title="Tambah kabar pengiriman"
              description="Pilih posisi terbaru agar pemesan bisa memantau progres."
              className="mb-1"
            />
            <input type="hidden" name="orderId" value={order.id} />
            <label className="grid gap-2 text-sm font-medium">
              Stage
              <Select name="stage" defaultValue="ORDERED_TO_SOURCE">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDERED_TO_SOURCE">
                    Order ke website
                  </SelectItem>
                  <SelectItem value="TO_OVERSEAS_WAREHOUSE">
                    Menuju gudang luar negeri
                  </SelectItem>
                  <SelectItem value="AT_OVERSEAS_WAREHOUSE">
                    Di gudang luar negeri
                  </SelectItem>
                  <SelectItem value="TO_INDONESIA_WAREHOUSE">
                    Menuju gudang Indonesia
                  </SelectItem>
                  <SelectItem value="AT_INDONESIA_WAREHOUSE">
                    Di gudang Indonesia
                  </SelectItem>
                  <SelectItem value="TO_JOGJA">Menuju Jogja</SelectItem>
                  <SelectItem value="AT_JOGJA">Di Jogja</SelectItem>
                  <SelectItem value="SHOPEE_CHECKOUT_PENDING">
                  Checkout Shopee
                  </SelectItem>
                  <SelectItem value="FINAL_DELIVERY">
                    Pengiriman final
                  </SelectItem>
                  <SelectItem value="DELIVERED">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <input
              name="location"
              className="app-field"
              placeholder="Lokasi"
            />
            <input
              name="trackingNumber"
              className="app-field"
              placeholder="Tracking/resi opsional"
            />
            <textarea
              name="notes"
              rows={3}
              className="app-field min-h-24 py-2"
              placeholder="Catatan pengiriman"
            />
            <Button type="submit" className="w-full sm:w-auto">
              Tambah kabar pengiriman
            </Button>
          </form>

          <div className="app-surface p-3.5 sm:p-5">
            <SectionHeader
              title="Status checkout Shopee"
              description="Informasi checkout yang terlihat oleh pemesan."
            />
            {order.shopeeCheckout ? (
              <div className="space-y-3 text-sm">
                <StatusBadge
                  tone={
                    order.shopeeCheckout.verificationStatus === "VERIFIED"
                      ? "green"
                      : order.shopeeCheckout.verificationStatus === "REJECTED"
                        ? "red"
                        : "amber"
                  }
                >
                  {order.shopeeCheckout.verificationStatus}
                </StatusBadge>
                <p className="text-muted-foreground">
                  {order.shopeeCheckout.instructionText ??
                    "Instruksi checkout belum diisi."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada instruksi checkout Shopee untuk order ini.
              </p>
            )}
          </div>

          <form
            action={upsertShopeeInstructionAction}
            className="app-surface grid gap-3 p-3.5 sm:p-5"
          >
            <SectionHeader
              title="Instruksi Shopee"
              description="Isi arahan dan link yang harus diikuti pemesan."
              className="mb-1"
            />
            <input type="hidden" name="orderId" value={order.id} />
            <textarea
              required
              name="instructionText"
              rows={3}
              className="app-field min-h-24 py-2"
              placeholder="Arahan checkout untuk pemesan"
              defaultValue={order.shopeeCheckout?.instructionText ?? ""}
            />
            <input
              name="instructionUrl"
              className="app-field"
              placeholder="https://shopee.co.id/..."
              defaultValue={order.shopeeCheckout?.instructionUrl ?? ""}
            />
            <Button type="submit" className="w-full sm:w-auto">
              Simpan instruksi Shopee
            </Button>
          </form>
        </aside>
      </div>
    </AdminShell>
  )
}
