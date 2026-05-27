import { AdminShell } from "@/components/admin-shell"
import { StatusBadge } from "@/components/status-badge"
import { getBatches } from "@/lib/admin-data"
import { requireAdminUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function AdminBatchesPage() {
  await requireAdminUser()
  const batches = await getBatches()

  return (
    <AdminShell
      title="PO Batch"
      description="Kelola periode PO. CRUD action akan memakai schema yang sudah disiapkan."
    >
      <section className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Daftar batch</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tutup PO</th>
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Order</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-muted-foreground">
                    Belum ada PO batch.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{batch.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        tone={batch.status === "OPEN" ? "green" : "neutral"}
                      >
                        {batch.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      {batch.closeAt
                        ? new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                          }).format(batch.closeAt)
                        : "-"}
                    </td>
                    <td className="px-4 py-3">{batch._count.products}</td>
                    <td className="px-4 py-3">{batch._count.orders}</td>
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
