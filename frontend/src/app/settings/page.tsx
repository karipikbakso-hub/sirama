import ProtectedLayout from '../../components/ProtectedLayout'
import SettingsPage from '../../features/settings'

export default function Page() {
  return (
    <ProtectedLayout>
      <SettingsPage />
    </ProtectedLayout>
  )
}
