import Link from "next/link"
import { notFound } from "next/navigation"
import { AppAlert } from "@/components/app-alert"
import { BackLinkButton, SectionHeader } from "@/components/page-chrome"
import { ProofFileInput } from "@/components/proof-file-input"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, paymentStatusLabel, shipmentStatusLabel } from "@/lib/format"
import { isDatabaseConfigured } from "@/lib/env"
import { prisma } from "@/lib/prisma"
import {
  submitFinalPaymentAction,
  submitShopeeCheckoutProofAction,
} from "./actions"

export const dynamic = "force-dynamic"

type OrderStatusPageProps = {
  params: Promise<{
    orderCode: string
  }>
  searchParams: Promise<{
    status?: string
    message?: string
  }>
}

export default async function OrderStatusPage({
  params,
  searchParams,
}: OrderStatusPageProps) {
  const { orderCode } = await params
  const flash = await searchParams

  if (!isDatabaseConfigured()) {
    notFound()
  }

  const order = await prisma.order.findUnique({
    where: {
      orderCode,
    },
    include: {
      customer: true,
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
    <main className="min-h-svh">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-5 py-8 md:px-8 md:py-12">
        <BackLinkButton href="/">Kembali ke katalog</BackLinkButton>
        <AppAlert status={flash.status} message={flash.message} />

        <section className="app-surface p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <p className="text-sm text-muted-foreground">Kode order</p>
              <h1 className="text-3xl font-semibold">{order.orderCode}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Pemesan: {order.customer.name}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="amber">
                {paymentStatusLabel[order.paymentStatus]}
              </StatusBadge>
              <StatusBadge tone="blue">
                {shipmentStatusLabel[order.shipmentStatus]}
              </StatusBadge>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="app-surface p-5">
            <SectionHeader
              title="Item order"
              description="Ringkasan barang dan pilihan yang kamu pesan."
            />
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

          <div className="app-surface p-5">
            <SectionHeader
              title="Pembayaran"
              description="Status DP dan pelunasan yang sudah tercatat."
            />
            <div className="space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Estimasi total</span>
                <span className="font-medium">
                  {formatCurrency(order.estimatedTotal)}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">DP tercatat</span>
                <span className="font-medium">{formatCurrency(order.dpTotal)}</span>
              </div>
              {order.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-md border bg-background p-3 text-sm"
                >
                  <div className="flex justify-between gap-3">
                    <span>{payment.type}</span>
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
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="app-surface p-5">
          <SectionHeader
            title="Timeline pengiriman"
            description="Kabar posisi barang dari admin akan muncul di sini."
          />
          {order.shipmentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Pengiriman belum dimulai. Status akan muncul setelah admin memberi
              kabar terbaru.
            </p>
          ) : (
            <div className="space-y-3">
              {order.shipmentEvents.map((event) => (
                <div key={event.id} className="rounded-md border bg-background p-3">
                  <p className="font-medium">{shipmentStatusLabel[event.stage]}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.location ?? "Lokasi belum diisi"} -{" "}
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "medium",
                    }).format(event.eventAt)}
                  </p>
                  {event.notes ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {event.notes}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        {order.shopeeCheckout ? (
          <section className="app-surface p-5">
            <SectionHeader
              title="Checkout Shopee"
              description="Kirim link pesanan atau bukti checkout setelah mengikuti arahan admin."
            />
            <p className="text-sm text-muted-foreground">
              {order.shopeeCheckout.instructionText ??
                "Instruksi checkout Shopee sudah tersedia dari admin."}
            </p>
            {order.shopeeCheckout.instructionUrl ? (
              <Button asChild className="mt-4">
                <Link href={order.shopeeCheckout.instructionUrl}>
                  Buka link Shopee
                </Link>
              </Button>
            ) : null}
            <form
              action={submitShopeeCheckoutProofAction}
              className="mt-5 grid gap-3 border-t pt-5"
            >
              <input type="hidden" name="orderCode" value={order.orderCode} />
              <label className="grid gap-2 text-sm font-medium">
                Link pesanan Shopee
                <input
                  name="customerInvoiceUrl"
                  type="url"
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  placeholder="https://shopee.co.id/..."
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Bukti checkout opsional
                <ProofFileInput
                  name="proofFile"
                />
              </label>
              <Button type="submit">Kirim bukti checkout Shopee</Button>
            </form>
          </section>
        ) : null}

        <section className="app-surface p-5">
          <SectionHeader
            title="Kirim bukti pelunasan"
            description="Gunakan form ini setelah admin menginfokan nominal final."
          />
          <form action={submitFinalPaymentAction} className="grid gap-3">
            <input type="hidden" name="orderCode" value={order.orderCode} />
            <label className="grid gap-2 text-sm font-medium">
              Nominal pelunasan
              <input
                required
                name="amount"
                type="number"
                min="1"
                className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="100000"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Bukti pelunasan
              <ProofFileInput
                required
                name="proofFile"
              />
            </label>
            <Button type="submit">Kirim bukti pelunasan</Button>
          </form>
        </section>
      </div>
    </main>
  )
}
