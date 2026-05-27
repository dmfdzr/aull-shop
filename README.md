# Aull Shop PO System

Commit message: `docs: document aull shop po system overview`

Aull Shop PO System adalah aplikasi web full-stack untuk operasional pre-order merch K-pop. Aplikasi ini akan memakai Next.js sebagai frontend dan backend, Prisma sebagai ORM, Supabase Postgres sebagai database, Supabase Auth untuk login admin, dan Supabase Storage untuk bukti pembayaran serta bukti checkout Shopee.

Dokumen desain lengkap tersedia di [docs/superpowers/specs/2026-05-27-aull-shop-po-system-design.md](docs/superpowers/specs/2026-05-27-aull-shop-po-system-design.md).

## Product Direction

Versi awal dibangun sebagai modular MVP dengan dua sisi utama:

- Customer publik tanpa login.
- Admin internal dengan Supabase Auth.

Customer bisa melihat katalog PO aktif, memilih produk dan varian, mengisi data pemesanan, upload bukti DP, mengecek status order dengan order code, melunasi pembayaran, lalu submit bukti atau invoice checkout Shopee saat barang siap dikirim.

Admin mengelola PO batch, katalog produk, varian, masterlist order, verifikasi pembayaran, shipment timeline, instruksi checkout Shopee, dan export laporan CSV/XLSX.

## Core Workflow

1. Admin membuat PO batch selama masa pre-order.
2. Admin membuat katalog produk dan varian merch K-pop.
3. Customer mengisi form order dan upload bukti DP.
4. Order masuk ke masterlist admin.
5. Setelah PO close, admin order barang ke website sumber.
6. Admin tracking shipment dari website ke warehouse Korea/Japan/China.
7. Admin tracking shipment ke warehouse Indonesia.
8. Customer melunasi barang dan upload bukti pembayaran.
9. Admin tracking shipment dari warehouse Indonesia ke Jogja.
10. Customer checkout Shopee dan submit bukti atau link invoice.
11. Admin verifikasi checkout dan update resi/final delivery.

## V1 Scope

- Katalog PO berbasis batch.
- Produk dengan varian terstruktur.
- Customer order tanpa login.
- Admin login dengan Supabase Auth.
- Payment proof upload untuk DP dan pelunasan.
- Supabase Storage dengan batas tipe file dan ukuran agar storage/bandwidth terkendali.
- Status order, payment, dan shipment dipisah.
- Shipment timeline berbasis event.
- Manual Shopee checkout dengan audit trail.
- Export masterlist ke CSV dan XLSX.

## Deferred Features

Fitur berikut sengaja tidak masuk v1 agar delivery tetap realistis:

- Payment gateway seperti Midtrans atau Xendit.
- Integrasi Shopee API.
- Customer account dan order history.
- Role finance atau warehouse.
- Async export job.
- Free-form product request dari customer.

Fitur tersebut bisa masuk fase berikutnya setelah volume order dan kebutuhan operasionalnya jelas.

## Tech Stack

- Next.js App Router
- React
- TypeScript/TSX
- Tailwind CSS
- shadcn/ui
- Prisma
- Supabase Postgres
- Supabase Auth
- Supabase Storage

Project ini tetap memakai TSX karena scaffold dan komponen shadcn yang ada sudah berbasis TypeScript. Ini menjaga DX, type safety, dan konsistensi dengan ecosystem Next.js modern.

## Planned Domain Modules

- `batches`: lifecycle periode PO.
- `catalog`: produk dan varian.
- `orders`: order customer dan masterlist.
- `payments`: upload dan verifikasi DP/pelunasan.
- `shipments`: timeline pengiriman dan status posisi barang.
- `shopee`: instruksi checkout, bukti checkout, dan verifikasi.
- `exports`: laporan CSV/XLSX.

## Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Environment Variables

Prisma dan Supabase akan membutuhkan environment variables saat implementasi database dimulai:

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh digunakan di server-side code. Jangan expose key ini ke client component atau public bundle.
