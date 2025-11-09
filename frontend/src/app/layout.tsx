import type { Metadata } from 'next'
import '../styles/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'SIRAMA',
  description: 'Dashboard modern untuk SIMRS SIRAMA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-satoshi antialiased bg-background text-foreground transition-colors duration-300">
        <Providers>
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  )
}