import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'SIRAMA Admin',
  description: 'Dashboard modern untuk SIMRS SIRAMA',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.cdnfonts.com/css/satoshi" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gray-100 dark:bg-gray-900">
        {children}
      </body>
    </html>
  )
}