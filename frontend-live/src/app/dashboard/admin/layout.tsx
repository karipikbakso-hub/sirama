import AdminLayout from './AdminLayout'

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}