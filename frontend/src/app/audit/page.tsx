import ProtectedLayout from '../../components/ProtectedLayout'
import AuditPage from '../../features/audit'

export default function Page() {
  return (
    <ProtectedLayout>
      <AuditPage />
    </ProtectedLayout>
  )
}
