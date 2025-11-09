'use client'

import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUserMutation } from '@/hooks/useUserMutation'

type UserPayload = {
  id?: number
  name: string
  username: string
  email: string
}

export default function UserFormModal({
  user,
  onClose,
  onSuccess,
}: {
  user?: UserPayload
  onClose: () => void
  onSuccess: () => void
}) {
  const { register, handleSubmit, reset } = useForm<UserPayload>()

  useEffect(() => {
    reset(user ?? { name: '', username: '', email: '' })
  }, [user, reset])

  const { addOrEdit } = useUserMutation({ onSuccess })

  return (
    <Modal title={user ? 'Edit User' : 'Tambah User'} onClose={onClose}>
      <form
        onSubmit={handleSubmit(data => addOrEdit.mutate(data))}
        className="space-y-4"
      >
        <Input label="Nama" {...register('name', { required: true })} />
        <Input label="Username" {...register('username', { required: true })} />
        <Input label="Email" type="email" {...register('email', { required: true })} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={addOrEdit.isPending}>
            {user ? 'Simpan' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}