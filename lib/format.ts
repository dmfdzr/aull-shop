export const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number | string | { toString(): string }) {
  return currencyFormatter.format(Number(value))
}

export const paymentStatusLabel = {
  WAITING_DP: "Menunggu DP",
  DP_SUBMITTED: "DP dikirim",
  DP_VERIFIED: "DP verified",
  WAITING_FINAL_PAYMENT: "Menunggu pelunasan",
  FINAL_SUBMITTED: "Pelunasan dikirim",
  PAID: "Lunas",
  REJECTED: "Ditolak",
} as const

export const shipmentStatusLabel = {
  NOT_STARTED: "Belum diproses",
  ORDERED_TO_SOURCE: "Order ke website",
  TO_OVERSEAS_WAREHOUSE: "Menuju warehouse luar",
  AT_OVERSEAS_WAREHOUSE: "Di warehouse luar",
  TO_INDONESIA_WAREHOUSE: "Menuju warehouse Indo",
  AT_INDONESIA_WAREHOUSE: "Di warehouse Indo",
  TO_JOGJA: "Menuju Jogja",
  AT_JOGJA: "Di Jogja",
  SHOPEE_CHECKOUT_PENDING: "Checkout Shopee",
  FINAL_DELIVERY: "Pengiriman final",
  DELIVERED: "Selesai",
} as const
