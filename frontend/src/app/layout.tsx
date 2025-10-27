import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export const metadata = { title: 'SIRAMA Demo', description: 'SIRAMA - Demo Fase 1' }

export default function RootLayout({ children }: { children: React.ReactNode }){
return (
<html lang="id">
<body>
<ThemeProvider attribute="data-theme" defaultTheme="system">
<div className="app-shell">
<Navbar />
<div className="flex">
<Sidebar />
<main className="flex-1 p-6">{children}</main>
</div>
</div>
</ThemeProvider>
</body>
</html>
)
}
