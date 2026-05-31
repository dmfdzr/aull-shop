import "./globals.css"
import type { Metadata } from "next"
import ClickSpark from "@/components/ClickSpark"
import { ThemeProvider } from "@/components/theme-provider"
import { Raleway } from "next/font/google"

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
})

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
      className={`${raleway.variable} font-sans antialiased`}
    >
      <body>
        <ClickSpark
          sparkColor="#7bbff2"
          sparkSize={9}
          sparkRadius={22}
          sparkCount={10}
          duration={430}
          easing="ease-out"
          extraScale={1.25}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </ClickSpark>
      </body>
    </html>
  )
}
