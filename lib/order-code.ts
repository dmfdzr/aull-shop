export function createOrderCode() {
  const datePart = new Date()
    .toISOString()
    .slice(2, 10)
    .replaceAll("-", "")
  const randomPart = crypto.randomUUID().slice(0, 8).toUpperCase()

  return `SKZ-${datePart}-${randomPart}`
}
