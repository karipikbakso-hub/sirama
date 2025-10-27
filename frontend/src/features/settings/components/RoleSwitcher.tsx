import { useProfile } from '../hooks'

export default function RoleSwitcher() {
  const { profile, update } = useProfile()

  const toggleRole = () => {
    const newRole = profile.role === 'admin' ? 'kasir' : 'admin'
    update({ ...profile, role: newRole })
  }

  return (
    <div className="mt-6">
      <p className="text-sm">Role saat ini: <strong>{profile.role}</strong></p>
      <button onClick={toggleRole} className="mt-2 bg-gray-700 text-white px-4 py-2 rounded">
        Ganti Role
      </button>
    </div>
  )
}
