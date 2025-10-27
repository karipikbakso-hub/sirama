import { useState } from 'react'
import { useProfile } from '../hooks'
import { UserProfile } from '../types'

export default function ProfileForm() {
  const { profile, update } = useProfile()
  const [form, setForm] = useState<UserProfile>(profile)

  const handleChange = (field: keyof UserProfile, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    update(form)
    alert('Profil berhasil diperbarui')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium">Nama</label>
        <input
          type="text"
          value={form.nama}
          onChange={e => handleChange('nama', e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          type="text"
          value={form.username}
          onChange={e => handleChange('username', e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={e => handleChange('password', e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Simpan Perubahan
      </button>
    </form>
  )
}
