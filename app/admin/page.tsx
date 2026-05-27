import { AdminShell } from "@/components/admin-shell"
import { AppAlert } from "@/components/app-alert"
import { StatusBadge } from "@/components/status-badge"
import { getAdminDashboardStats, getRecentOrders } from "@/lib/admin-data"
import { formatCurrency, paymentStatusLabel, shipmentStatusLabel } from "@/lib/format"
import { requireAdminUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

type AdminDashboardPageProps = {
  searchParams: Promise<{
    status?: string
    message?: string
  }>
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  await requireAdminUser()
  const flash = await searchParams
  const [stats, recentOrders] = await Promise.all([
    getAdminDashboardStats(),
    getRecentOrders(),
  ])

  const statCards = [
    { label: "PO aktif", value: stats.activeBatches },
    { label: "DP perlu verifikasi", value: stats.pendingDpVerification },
    { label: "Menunggu pelunasan", value: stats.waitingFinalPayment },
    { label: "Shipment berjalan", value: stats.shipmentsInProgress },
    { label: "Checkout Shopee pending", value: stats.shopeePending },
  ]

  return (
    <AdminShell
      title="Dashboard"
      description="Ringkasan operasional PO dan pekerjaan yang perlu dicek."
    >
      <AppAlert status={flash.status} message={flash.message} />
      <section className="grid gap-3 md:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-cyan-100 bg-white/90 shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold">Order terbaru</h2>
          <p className="text-sm text-muted-foreground">
            Snapshot cepat sebelum masuk ke masterlist lengkap.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Shipment</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-muted-foreground">
                    Belum ada order atau database belum dikonfigurasi.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{order.orderCode}</td>
                    <td className="px-4 py-3">{order.customer.name}</td>
                    <td className="px-4 py-3">{order.batch.name}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(order.estimatedTotal)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone="amber">
                        {paymentStatusLabel[order.paymentStatus]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone="blue">
                        {shipmentStatusLabel[order.shipmentStatus]}
                      </StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  )
}
