import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: {
    default: "SKZ Mart",
    template: "%s | SKZ Mart",
  },
  description: "SKZ Mart preorder hub.",
  icons: {
    icon: [
      {
        url: "/assets/favicon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/assets/favicon.png",
        type: "image/png",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="font-sans antialiased"
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
