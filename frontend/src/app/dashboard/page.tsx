import ProtectedLayout from '../../components/ProtectedLayout'
import DashboardPage from '../../features/dashboard'

export default function Page() {
  return (
    <ProtectedLayout allowedRoles={['admin', 'kasir']}>
      <DashboardPage />
    </ProtectedLayout>
  )
}
