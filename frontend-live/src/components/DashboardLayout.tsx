import SidebarAdmin from '@/components/SidebarAdmin'
import MobileNav from '@/components/MobileNav'

export default function DashboardLayout({
  title,
  onLogout,
  children,
}: {
  title: string
  onLogout: () => void
  children: React.ReactNode
}) {
  return (
    <>
      {/* Layout Utama */}
      <div className="flex min-h-screen">
        {/* Sidebar Desktop */}
        <SidebarAdmin />

        {/* Konten */}
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
            <button onClick={onLogout} className="text-sm text-blue-600 hover:underline">
              Keluar
            </button>
          </header>

          <main className="p-6 space-y-6">{children}</main>
        </div>
      </div>

      {/* Bottom Bar Mobile — harus di luar flex */}
      <MobileNav />
    </>
  )
}