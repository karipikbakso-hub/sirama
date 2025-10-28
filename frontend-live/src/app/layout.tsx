import type { Metadata } from 'next'
import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: 'SIRAMA',
  description: 'Dashboard modern untuk SIMRS SIRAMA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-satoshi antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}