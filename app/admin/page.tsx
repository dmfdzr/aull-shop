import { AdminShell } from "@/components/admin-shell"
import { AppAlert } from "@/components/app-alert"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { getAdminDashboardStats, getRecentOrders } from "@/lib/admin-data"
import { formatCurrency, paymentStatusLabel, shipmentStatusLabel } from "@/lib/format"
import { requireAdminUser } from "@/lib/auth"
import Link from "next/link"

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
    { label: "PO aktif", value: stats.activeBatches, tone: "blue" },
    { label: "DP perlu verifikasi", value: stats.pendingDpVerification, tone: "amber" },
    { label: "Menunggu pelunasan", value: stats.waitingFinalPayment, tone: "amber" },
    { label: "Pengiriman berjalan", value: stats.shipmentsInProgress, tone: "green" },
    { label: "Checkout Shopee pending", value: stats.shopeePending, tone: "blue" },
  ]

  return (
    <AdminShell
      title="Beranda"
      description="Ringkasan operasional PO dan pekerjaan yang perlu dicek."
    >
      <AppAlert status={flash.status} message={flash.message} />
      <section className="app-surface app-panel-highlight mb-6 grid gap-5 p-3.5 sm:p-5 md:grid-cols-[1.2fr_0.8fr] md:p-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-primary">
            Pusat kerja admin
          </p>
          <h2 className="mt-2 text-xl font-semibold sm:text-2xl md:text-3xl">
            Prioritaskan pekerjaan yang menahan order.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Halaman ini menampilkan pekerjaan yang paling perlu dicek:
            verifikasi DP, pelunasan, pengiriman, dan checkout Shopee. Data
            dibuat ringkas supaya admin bisa langsung membuka daftar order
            saat butuh detail.
          </p>
        </div>
        <div className="grid content-start gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link href="/admin/orders">Buka daftar order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">Kelola katalog</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="app-stat-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <StatusBadge tone={card.tone as "blue" | "amber" | "green"}>
                Aktif
              </StatusBadge>
            </div>
            <p className="text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="app-table mt-6">
        <div className="flex flex-col justify-between gap-3 border-b p-3.5 sm:p-4 md:flex-row md:items-center md:p-5">
          <div>
            <h2 className="font-semibold">Order terbaru</h2>
            <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan cepat sebelum membuka daftar order lengkap.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/admin/orders">Lihat semua order</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Pemesan</th>
                <th className="px-4 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Pembayaran</th>
                <th className="px-4 py-3 font-medium">Pengiriman</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-muted-foreground">
                    Belum ada order masuk.
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
