import ProtectedLayout from '../../components/ProtectedLayout'
import KasirPage from '../../features/kasir'

export default function Page() {
  return (
    <ProtectedLayout>
      <KasirPage />
    </ProtectedLayout>
  )
}
