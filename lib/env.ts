const placeholderTokens = ["[PASSWORD]", "[HOST]", "your-project", "your-"]

export function isDatabaseConfigured() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    return false
  }

  return !placeholderTokens.some((token) => databaseUrl.includes(token))
}

export function assertDatabaseConfigured() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL belum dikonfigurasi.")
  }
}
