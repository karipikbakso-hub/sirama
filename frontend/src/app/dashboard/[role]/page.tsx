// app/dashboard/[role]/page.tsx

interface PageProps {
   params: Promise<{ role: string }>
}

export default async function DashboardPage({ params }: PageProps) {
   const { role } = await params

   // Render role-specific home page directly (no redirects needed)
   // Each role has its own home page implementation for better SPA experience
   return <RoleHomePage role={role} />
}

function RoleHomePage({ role }: { role: string }) {
  // Import and render role-specific home components from individual pages
  switch (role) {
    case 'admin':
      const AdminHome = require('./admin/page').default
      return <AdminHome />
    case 'pendaftaran':
      const PendaftaranHome = require('./pendaftaran/page').default
      return <PendaftaranHome />
    case 'dokter':
      const DokterHome = require('./dokter/page').default
      return <DokterHome />
    case 'perawat':
      const PerawatHome = require('./perawat/page').default
      return <PerawatHome />
    case 'apoteker':
      const ApotekerHome = require('./apoteker/page').default
      return <ApotekerHome />
    case 'kasir':
      const KasirHome = require('./kasir/page').default
      return <KasirHome />
    case 'manajemenrs':
      const ManajemenRsHome = require('./manajemenrs/page').default
      return <ManajemenRsHome />
    default:
      return <GenericHomePage role={role} />
  }
}

function GenericHomePage({ role }: { role: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 capitalize">Dashboard {role}</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Selamat datang di dashboard {role}. Halaman ini sedang dalam pengembangan.
      </p>
    </div>
  )
}
