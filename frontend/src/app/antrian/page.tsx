import ProtectedLayout from '../../components/ProtectedLayout'
import AntrianPage from '../../features/antrian'

export default function Page() {
  return (
    <ProtectedLayout>
      <AntrianPage />
    </ProtectedLayout>
  )
}
