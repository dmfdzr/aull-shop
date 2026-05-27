import { AdminShell } from "@/components/admin-shell"
import { AppAlert } from "@/components/app-alert"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { getBatches } from "@/lib/admin-data"
import { requireAdminUser } from "@/lib/auth"
import { createBatchAction, updateBatchStatusAction } from "./actions"

export const dynamic = "force-dynamic"

type AdminBatchesPageProps = {
  searchParams: Promise<{
    status?: string
    message?: string
  }>
}

export default async function AdminBatchesPage({
  searchParams,
}: AdminBatchesPageProps) {
  await requireAdminUser()
  const flash = await searchParams
  const batches = await getBatches()

  return (
    <AdminShell
      title="PO Batch"
      description="Kelola periode PO, buka/tutup batch, dan siapkan katalog merch."
    >
      <AppAlert status={flash.status} message={flash.message} />
      <section className="app-surface mb-6 p-5">
        <div className="mb-4">
          <h2 className="font-semibold">Tambah PO batch</h2>
          <p className="text-sm text-muted-foreground">
            Batch berstatus OPEN akan langsung tampil di katalog customer.
          </p>
        </div>
        <form action={createBatchAction} className="grid gap-4 lg:grid-cols-6">
          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            Nama batch
            <input
              required
              name="name"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="PO Album Comeback Juni"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Negara
            <input
              name="sourceCountry"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="Korea"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Buka PO
            <input
              name="openAt"
              type="datetime-local"
              className="h-10 rounded-md border bg-background px-3 text-sm"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Tutup PO
            <input
              name="closeAt"
              type="datetime-local"
              className="h-10 rounded-md border bg-background px-3 text-sm"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Status
            <select
              name="status"
              defaultValue="OPEN"
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium lg:col-span-5">
            Deskripsi
            <input
              name="description"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="Catatan internal atau info PO"
            />
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Simpan PO batch
            </Button>
          </div>
        </form>
      </section>

      <section className="app-table">
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
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-muted-foreground">
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
                    <td className="px-4 py-3">
                      <form
                        action={updateBatchStatusAction}
                        className="grid min-w-48 gap-1"
                      >
                        <input type="hidden" name="id" value={batch.id} />
                        <div className="flex gap-2">
                          <select
                            name="status"
                            defaultValue={batch.status}
                            className="h-9 rounded-md border bg-background px-2 text-xs"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                            <option value="ORDERED">Ordered</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                          <Button type="submit" variant="outline" size="sm">
                            Update status
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          OPEN tampil untuk customer, CLOSED menutup order baru.
                        </p>
                      </form>
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
