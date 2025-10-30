import type { Metadata } from 'next'
import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: 'SIRAMA',
  description: 'Dashboard modern untuk SIMRS SIRAMA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-satoshi antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}