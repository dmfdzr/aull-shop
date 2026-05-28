# SKZmart PO System Design

Commit message: `docs: define modular po system design`

## Summary

SKZmart needs a full-stack Next.js application for K-pop merchandise pre-orders. Version 1 will be a modular MVP with a public customer flow and an authenticated admin flow. Customers can order from active PO catalog batches without logging in, upload payment proof, track order status by order code, and submit Shopee checkout proof when the item is ready. Admins manage PO batches, catalog items, variants, masterlist operations, payment verification, shipment tracking, and CSV/XLSX exports.

The app will use the existing Next.js, React, Tailwind CSS, and shadcn setup. The repository is currently TSX-based, and the project will continue with TSX for consistency with the scaffold and generated component system.

## Goals

- Let customers submit PO orders during an open PO period with DP proof.
- Give admins a clean operational masterlist for updating orders after PO close.
- Track international purchase and shipping movement from source website to overseas warehouse, Indonesia warehouse, Jogja, then final Shopee checkout and delivery.
- Separate order, payment, and shipment state so operations stay accurate when real-world timing is not perfectly linear.
- Store proof files in Supabase Storage with strict file type and size limits to control storage and bandwidth.
- Export filtered masterlist reports as CSV and XLSX.

## Non-Goals For V1

- Payment gateway integration.
- Shopee API integration.
- Customer login.
- Warehouse or finance-specific roles.
- Async background export jobs.
- Free-form customer product request flow.

These are valid later-phase features once order volume and operational pain justify the added complexity.

## Users And Access

Customer access is public and does not require login. Customers create orders from active catalog batches and use a generated order code to check status.

Admin access uses Supabase Auth email/password. V1 has one admin role with access to catalog, batch, order, payment, shipment, Shopee checkout, and export features. The database should leave room for future role expansion without implementing role complexity now.

## Product Scope

The v1 product model is catalog-first. Admins create PO batches, products, and structured variants. Customers select from these variants instead of typing arbitrary item names. This keeps the masterlist clean, improves reporting, and avoids repeated manual cleanup for K-pop merch options such as album version, member, size, color, or country-specific variant.

The visual direction should be K-pop merch operations: energetic and collectible on the customer side, but still dense and efficient for admin workflows. The admin interface should be table-first with strong filters, status chips, timelines, and concise action panels. The customer interface should be mobile-first because most traffic will likely come from WhatsApp, Instagram, or social links.

## Architecture

- Next.js App Router provides public pages, admin pages, server actions, and route handlers.
- Prisma connects to Supabase Postgres and owns business data modeling.
- Supabase Auth manages admin authentication.
- Supabase Storage stores payment and Shopee checkout proofs.
- Server-side validation is required for every mutation, even when client-side validation exists for user experience.

The recommended implementation keeps the app modular by domain:

- `batches`: PO period lifecycle.
- `catalog`: products and variants.
- `orders`: customer order creation and masterlist views.
- `payments`: proof upload and verification.
- `shipments`: shipment timeline and current shipment state.
- `shopee`: manual Shopee checkout instructions and verification.
- `exports`: CSV/XLSX reporting.

This is more structured than a spreadsheet clone, but still much lighter than a full enterprise workflow system.

## Data Model

### AdminProfile

Stores admin metadata linked to Supabase Auth:

- `id`
- `authUserId`
- `email`
- `name`
- `role`
- `createdAt`
- `updatedAt`

V1 supports only `ADMIN`.

### PoBatch

Represents a PO period:

- `id`
- `name`
- `description`
- `sourceCountry`
- `openAt`
- `closeAt`
- `status`
- `createdAt`
- `updatedAt`

Status values: `DRAFT`, `OPEN`, `CLOSED`, `ORDERED`, `COMPLETED`.

### Product

Represents a catalog item inside a batch:

- `id`
- `batchId`
- `name`
- `description`
- `sourceCountry`
- `sourceUrl`
- `estimatedPrice`
- `minimumDp`
- `imagePath`
- `isActive`
- `createdAt`
- `updatedAt`

### ProductVariant

Represents structured product options:

- `id`
- `productId`
- `label`
- `sku`
- `priceOverride`
- `priceAdjustment`
- `quota`
- `isActive`
- `createdAt`
- `updatedAt`

### Customer

Stores customer identity without login:

- `id`
- `name`
- `whatsapp`
- `email`
- `address`
- `createdAt`
- `updatedAt`

The app may deduplicate lightly by WhatsApp number, but it should not block order creation if the customer data has small variations.

### Order

Stores the order header:

- `id`
- `orderCode`
- `customerId`
- `batchId`
- `estimatedTotal`
- `dpTotal`
- `notes`
- `orderStatus`
- `paymentStatus`
- `shipmentStatus`
- `createdAt`
- `updatedAt`

`orderCode` must be unique and safe to share with customers.

Order status values should cover the business lifecycle without mixing payment and shipment concerns:

- `SUBMITTED`
- `CONFIRMED`
- `PO_CLOSED`
- `ORDERED_TO_SOURCE`
- `READY_FOR_SHOPEE`
- `COMPLETED`
- `CANCELLED`

Payment status values:

- `WAITING_DP`
- `DP_SUBMITTED`
- `DP_VERIFIED`
- `WAITING_FINAL_PAYMENT`
- `FINAL_SUBMITTED`
- `PAID`
- `REJECTED`

Shipment status values:

- `NOT_STARTED`
- `ORDERED_TO_SOURCE`
- `TO_OVERSEAS_WAREHOUSE`
- `AT_OVERSEAS_WAREHOUSE`
- `TO_INDONESIA_WAREHOUSE`
- `AT_INDONESIA_WAREHOUSE`
- `TO_JOGJA`
- `AT_JOGJA`
- `SHOPEE_CHECKOUT_PENDING`
- `FINAL_DELIVERY`
- `DELIVERED`

### OrderItem

Stores item snapshots:

- `id`
- `orderId`
- `productId`
- `variantId`
- `productNameSnapshot`
- `variantLabelSnapshot`
- `quantity`
- `unitPriceSnapshot`
- `subtotal`
- `createdAt`

Snapshots prevent historical reports from changing when the catalog is edited later.

### Payment

Stores DP and final payment records:

- `id`
- `orderId`
- `type`
- `amount`
- `proofPath`
- `verificationStatus`
- `verifiedByAdminId`
- `verifiedAt`
- `rejectionReason`
- `createdAt`
- `updatedAt`

Payment type values: `DP`, `FINAL`.

Verification values: `PENDING`, `VERIFIED`, `REJECTED`.

Proof upload constraints:

- Allow `jpg`, `jpeg`, `png`, `webp`, and `pdf`.
- Default max size should be 1-2 MB per file.
- Images should be compressed client-side when practical.
- The database stores file path or signed-access reference, not base64.

### ShipmentEvent

Stores shipment timeline entries:

- `id`
- `orderId`
- `stage`
- `location`
- `trackingNumber`
- `notes`
- `eventAt`
- `createdByAdminId`
- `createdAt`

This timeline approach is more flexible than adding one column per shipping milestone.

### ShopeeCheckout

Stores manual Shopee checkout instructions and proof:

- `id`
- `orderId`
- `instructionText`
- `instructionUrl`
- `customerInvoiceUrl`
- `customerProofPath`
- `verificationStatus`
- `finalTrackingNumber`
- `verifiedByAdminId`
- `verifiedAt`
- `createdAt`
- `updatedAt`

This keeps V1 manual while preserving an audit trail.

## Routes And UI

### Public Routes

`/`

Shows active PO batches and catalog items. It should prioritize active products, variant selection, price/DP clarity, and a direct order action. The visual tone should feel appropriate for K-pop merch: lively, collectible, and image-forward without becoming a marketing landing page.

`/checkout`

Customer order form. It collects customer data, selected product variants, quantities, notes, and DP proof upload. It must validate visible labels, required fields, file limits, and unavailable/closed PO states.

`/order/[orderCode]`

Customer status page. It shows order summary, payment state, shipment timeline, final payment requirement, and Shopee checkout instructions once eligible.

### Admin Routes

`/admin/login`

Supabase Auth email/password login.

`/admin`

Operational dashboard with counts for active PO, pending DP verification, pending final payment, shipment in progress, and Shopee checkout pending.

`/admin/batches`

Batch CRUD and close PO action.

`/admin/products`

Product and variant management.

`/admin/orders`

Main masterlist with filters for batch, order status, payment status, shipment status, source country, and text search. This page provides CSV/XLSX export based on the active filters.

`/admin/orders/[id]`

Order detail with customer data, items, payment proofs, shipment timeline, Shopee checkout proof, and status update actions.

## Core Flows

### Customer Creates Order

1. Customer selects active batch product variants.
2. Customer submits identity, order details, notes, and DP proof.
3. Server validates the PO is open, variants are active, quantities are valid, and file constraints pass.
4. Server creates customer, order, order items, and DP payment record in one transaction.
5. Customer receives order code and status page link.

### Admin Verifies Payment

1. Admin reviews uploaded proof.
2. Admin verifies or rejects payment with optional rejection reason.
3. Server updates the payment record.
4. Server derives and updates `paymentStatus` on the order.

### Admin Updates Shipment

1. Admin adds a shipment event.
2. Server records the event and updates current `shipmentStatus`.
3. Customer status page reflects the latest timeline.

### Admin Closes PO

1. Admin closes the batch.
2. Server prevents new orders for that batch.
3. Admin can continue with source website ordering and shipment updates.

### Customer Shopee Checkout

1. Admin marks the order ready for Shopee checkout and adds instructions.
2. Customer submits Shopee invoice link or proof.
3. Admin verifies checkout and enters final delivery tracking if needed.

## Export

Masterlist exports must support CSV and XLSX. V1 should generate exports directly from a server route using the same filters visible in the admin masterlist. This keeps reporting predictable and avoids exporting unrelated rows.

CSV is the lightweight option for large data and integrations. XLSX is for owner-facing reports and operational review. If exports become slow as data grows, add an `ExportJob` table and move generation to an async workflow later.

## Error Handling And Resilience

- Customer order creation must fail clearly if the PO is closed.
- File validation must show max size and allowed type errors before upload when possible, then revalidate on the server.
- Admin verification actions should be idempotent where practical. Re-verifying an already verified payment should not corrupt order state.
- Status transitions should be validated so impossible states are rejected.
- Missing orders should return a safe not-found response without exposing internal IDs.
- Public order status pages should use order codes rather than raw database IDs.

## Security

- Admin pages require Supabase Auth session checks.
- Public mutations must validate all submitted data server-side.
- Storage uploads must use constrained buckets and object paths.
- Proof files should not be publicly enumerable.
- Customer-facing pages must expose only the data needed for that customer's order status.
- Database queries should avoid leaking other customer records through predictable IDs.

## UI Quality Requirements

- Admin screens should be dense, readable, and table-first.
- Customer screens should be mobile-first and touch friendly.
- All form inputs need visible labels and clear field-level errors.
- Status must not rely on color alone; use text labels and consistent chips.
- Tables need stable columns, useful empty states, and responsive handling.
- The K-pop merch personality should appear through product imagery, tasteful accent colors, collectible-style badges, and energetic but restrained motion.
- Avoid decorative UI that slows repeated admin work.

## Testing And Verification

Minimum verification before delivery:

- `next build`
- linting if the current repo configuration supports it
- create order succeeds for open PO
- create order fails for closed PO
- DP proof validation rejects oversized or unsupported files
- verifying DP updates payment state
- adding shipment event updates shipment state
- Shopee checkout proof can be submitted and verified
- CSV and XLSX exports respect active filters
- customer flow works on mobile viewport
- admin masterlist works on desktop viewport

## Trade-Offs

The modular MVP has more upfront structure than a spreadsheet clone, but avoids fragile data cleanup and supports clean reporting. It is deliberately less complex than a full enterprise system with finance roles, payment gateway, Shopee API, and warehouse users. That is the right balance for validating operations while keeping the architecture ready for phase 2.

Payment gateway and Shopee API are deferred because they add external approval, failure modes, reconciliation complexity, and maintenance cost. Manual proof-based flows are slower but operationally transparent and practical for early-stage volume.

## Phase 2 Candidates

- Payment gateway integration through Midtrans or Xendit.
- Shopee API integration if business volume justifies platform setup.
- Finance and warehouse roles.
- Async export jobs.
- Customer accounts and order history.
- Rate limiting and stronger anti-spam controls for public order forms.
- Notification system for WhatsApp or email updates.
