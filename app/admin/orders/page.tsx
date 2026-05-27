import Link from "next/link"
import { AdminShell } from "@/components/admin-shell"
import { AppAlert } from "@/components/app-alert"
import { ActionToolbar, SectionHeader } from "@/components/page-chrome"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { getRecentOrders } from "@/lib/admin-data"
import { requireAdminUser } from "@/lib/auth"
import { formatCurrency, paymentStatusLabel, shipmentStatusLabel } from "@/lib/format"

export const dynamic = "force-dynamic"

type AdminOrdersPageProps = {
  searchParams: Promise<{
    status?: string
    message?: string
  }>
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  await requireAdminUser()
  const flash = await searchParams
  const orders = await getRecentOrders()

  return (
    <AdminShell
      title="Masterlist"
      description="Daftar order PO dengan status pembayaran dan shipment terpisah."
    >
      <AppAlert status={flash.status} message={flash.message} />
      <ActionToolbar
        title="Export laporan"
        description="Download masterlist untuk rekap owner atau pengecekan operasional."
      >
        <Button asChild variant="outline">
          <Link href="/api/admin/orders/export?format=csv">Download CSV</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/api/admin/orders/export?format=xlsx">Download XLSX</Link>
        </Button>
      </ActionToolbar>

      <section className="app-table">
        <div className="border-b p-4">
          <SectionHeader
            title="Order masuk"
            description="Pantau customer, batch, nilai order, pembayaran, dan posisi shipment."
            className="mb-0"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Batch</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Shipment</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-muted-foreground">
                    Belum ada order.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{order.orderCode}</td>
                    <td className="px-4 py-3">
                      <p>{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer.whatsapp}
                      </p>
                    </td>
                    <td className="px-4 py-3">{order.batch.name}</td>
                    <td className="px-4 py-3">{order.items.length}</td>
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
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/orders/${order.id}`}>Lihat order</Link>
                      </Button>
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
