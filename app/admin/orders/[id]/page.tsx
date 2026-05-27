import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminShell } from "@/components/admin-shell"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { requireAdminUser } from "@/lib/auth"
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
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  await requireAdminUser()
  const { id } = await params
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
      description="Detail order, pembayaran, shipment timeline, dan Shopee checkout."
    >
      <div className="mb-4">
        <Button asChild variant="outline">
          <Link href="/admin/orders">Kembali ke masterlist</Link>
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5">
          <div className="rounded-lg border bg-card p-5">
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
                <dt className="text-muted-foreground">Customer</dt>
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

          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 font-semibold">Item</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.productNameSnapshot}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.variantLabelSnapshot} x {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 font-semibold">Timeline shipment</h2>
            {order.shipmentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada shipment event.
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

        <aside className="space-y-5">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 font-semibold">Pembayaran</h2>
            <div className="space-y-3">
              {order.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-md border bg-background p-3 text-sm"
                >
                  <div className="flex justify-between gap-3">
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
                        <select
                          id={`status-${payment.id}`}
                          name="status"
                          className="h-9 rounded-md border bg-background px-2 text-sm"
                        >
                          <option value="VERIFIED">Verified</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                      </div>
                      <input
                        name="rejectionReason"
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        placeholder="Alasan reject opsional"
                      />
                      <Button type="submit" size="sm">
                        Simpan verifikasi
                      </Button>
                    </form>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <form
            action={addShipmentEventAction}
            className="grid gap-3 rounded-lg border bg-card p-5"
          >
            <h2 className="font-semibold">Tambah shipment event</h2>
            <input type="hidden" name="orderId" value={order.id} />
            <label className="grid gap-2 text-sm font-medium">
              Stage
              <select
                name="stage"
                className="h-10 rounded-md border bg-background px-2 text-sm"
              >
                <option value="ORDERED_TO_SOURCE">Order ke website</option>
                <option value="TO_OVERSEAS_WAREHOUSE">
                  Menuju warehouse luar
                </option>
                <option value="AT_OVERSEAS_WAREHOUSE">
                  Di warehouse luar
                </option>
                <option value="TO_INDONESIA_WAREHOUSE">
                  Menuju warehouse Indo
                </option>
                <option value="AT_INDONESIA_WAREHOUSE">
                  Di warehouse Indo
                </option>
                <option value="TO_JOGJA">Menuju Jogja</option>
                <option value="AT_JOGJA">Di Jogja</option>
                <option value="SHOPEE_CHECKOUT_PENDING">
                  Checkout Shopee
                </option>
                <option value="FINAL_DELIVERY">Pengiriman final</option>
                <option value="DELIVERED">Selesai</option>
              </select>
            </label>
            <input
              name="location"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="Lokasi"
            />
            <input
              name="trackingNumber"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="Tracking/resi opsional"
            />
            <textarea
              name="notes"
              rows={3}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Catatan shipment"
            />
            <Button type="submit">Tambah event</Button>
          </form>

          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-3 font-semibold">Shopee checkout</h2>
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
            className="grid gap-3 rounded-lg border bg-card p-5"
          >
            <h2 className="font-semibold">Instruksi Shopee</h2>
            <input type="hidden" name="orderId" value={order.id} />
            <textarea
              required
              name="instructionText"
              rows={3}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Instruksi checkout untuk customer"
              defaultValue={order.shopeeCheckout?.instructionText ?? ""}
            />
            <input
              name="instructionUrl"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="https://shopee.co.id/..."
              defaultValue={order.shopeeCheckout?.instructionUrl ?? ""}
            />
            <Button type="submit">Simpan instruksi</Button>
          </form>
        </aside>
      </div>
    </AdminShell>
  )
}
