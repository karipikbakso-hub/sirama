import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'

export const metadata = {
  title: 'SIRAMA Demo',
  description: 'SIRAMA - Demo Fase 1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
