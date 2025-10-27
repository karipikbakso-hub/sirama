import ProtectedLayout from '../../components/ProtectedLayout'
import PasienPage from '../../features/pasien'

export default function Page() {
  return (
    <ProtectedLayout>
      <PasienPage />
    </ProtectedLayout>
  )
}
