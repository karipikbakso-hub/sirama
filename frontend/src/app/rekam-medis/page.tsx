import ProtectedLayout from '../../components/ProtectedLayout'
import RekamMedisPage from '../../features/rekam-medis'

export default function Page() {
  return (
    <ProtectedLayout allowedRoles={['admin']}>
      <RekamMedisPage />
    </ProtectedLayout>
  )
}
