'use client'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-satoshi antialiased">
      {/* Navbar, Sidebar, dll */}
      {children}
    </div>
  )
}