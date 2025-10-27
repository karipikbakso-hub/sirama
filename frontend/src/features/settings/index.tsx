import ProfileForm from './components/ProfileForm'
import RoleSwitcher from './components/RoleSwitcher'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
      <ProfileForm />
      <RoleSwitcher />
    </div>
  )
}
