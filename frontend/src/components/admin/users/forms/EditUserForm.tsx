'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User as UserIcon, CheckCircleIcon } from 'lucide-react'
import { editUserSchema } from '@/schemas/userSchemas'
import type { EditUserFormData, User } from '@/types/user'
import { getStatusColor, getUserInitials } from '../lib/utils'
import { toast } from '@/lib/toast'

// Import mock data for now
import { mockRoles } from '@/lib/mockData'

// UI Components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormField } from '@/components/ui/modal-form'
import { Badge } from '@/components/ui/badge'

// Enhanced Role Selector Component
interface RoleSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, error }) => {
  const toggleRole = (roleId: string) => {
    if (value.includes(roleId)) {
      onChange(value.filter(id => id !== roleId))
    } else {
      onChange([...value, roleId])
    }
  }

  const selectedRoles = mockRoles.filter(role => value.includes(role.id))

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Role Pengguna *
        <span className="text-destructive ml-1">*</span>
      </Label>

      {/* Selected roles display */}
      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedRoles.map(role => (
            <Badge
              key={role.id}
              variant="secondary"
              className={`${getStatusColor(true)} cursor-pointer`}
              onClick={() => toggleRole(role.id)}
            >
              {role.name} ×
            </Badge>
          ))}
        </div>
      )}

      {/* Role selection grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {mockRoles.map(role => (
          <button
            key={role.id}
            type="button"
            onClick={() => toggleRole(role.id)}
            className={`
              p-3 rounded-lg border text-left transition-colors
              ${value.includes(role.id)
                ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                : 'hover:bg-muted border-border'
              }
            `}
          >
            <div className="font-medium text-sm">{role.name}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {role.slug}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  )
}

// User Avatar Component
interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg'
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20`}>
      <span className="font-semibold text-primary">
        {getUserInitials(user.fullName)}
      </span>
    </div>
  )
}

interface EditUserFormProps {
  data: User
  onSuccess: () => void
  onCancel?: () => void
}

export function EditUserForm({ data, onSuccess, onCancel }: EditUserFormProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      nip: data.nip || '',
      phone: data.phone || '',
      roleIds: data.roles.map(role => role.id),
      isActive: data.isActive
    }
  })

  // Track changes
  useEffect(() => {
    const subscription = watch((value) => {
      const originalValues = {
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        nip: data.nip || '',
        phone: data.phone || '',
        roleIds: data.roles.map(role => role.id).sort(),
        isActive: data.isActive
      }

      const currentValues = {
        username: value.username || '',
        email: value.email || '',
        fullName: value.fullName || '',
        nip: value.nip || '',
        phone: value.phone || '',
        roleIds: (value.roleIds || []).sort(),
        isActive: value.isActive
      }

      const changed = JSON.stringify(originalValues) !== JSON.stringify(currentValues)
      setHasChanges(changed)
    })

    return () => subscription.unsubscribe()
  }, [watch, data])

  const onSubmit = async (formData: EditUserFormData) => {
    try {
      // For now, just show success and call onSuccess
      // In real implementation, this would call the API
      console.log('Updating user:', data.id, formData)

      toast.success('Pengguna berhasil diperbarui!')

      // Small delay to show success animation
      setTimeout(() => {
        onSuccess()
      }, 500)
    } catch (error) {
      console.error('Update user error:', error)
      toast.error('Gagal memperbarui pengguna')
    }
  }

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <UserAvatar user={data} size="lg" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {data.fullName}
          </h3>
          <p className="text-sm text-muted-foreground">
            @{data.username} • {data.email}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(data.isActive)}>
              {data.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
            {data.roles.length > 0 && (
              <Badge variant="outline">
                {data.roles[0].name}
                {data.roles.length > 1 && ` +${data.roles.length - 1}`}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Username"
            required
            error={errors.username?.message}
            help="Hanya alfanumerik dan underscore"
          >
            <Input
              {...register('username')}
              placeholder="Masukkan username"
            />
          </FormField>

          <FormField
            label="Nama Lengkap"
            required
            error={errors.fullName?.message}
          >
            <Input
              {...register('fullName')}
              placeholder="Masukkan nama lengkap"
            />
          </FormField>
        </div>

        {/* Contact Information */}
        <FormField
          label="Email"
          required
          error={errors.email?.message}
          help="Email akan digunakan untuk login dan notifikasi"
        >
          <Input
            type="email"
            {...register('email')}
            placeholder="contoh@email.com"
          />
        </FormField>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="NIP (Nomor Induk Pegawai)"
            error={errors.nip?.message}
            help="18 digit nomor pegawai"
          >
            <Input
              {...register('nip')}
              placeholder="198501012010011001"
              maxLength={18}
            />
          </FormField>

          <FormField
            label="Nomor Telepon"
            error={errors.phone?.message}
            help="Format: 08xxxxxxxxxx"
          >
            <Input
              {...register('phone')}
              placeholder="081234567890"
              maxLength={13}
            />
          </FormField>
        </div>

        {/* Roles */}
        <Controller
          name="roleIds"
          control={control}
          render={({ field }) => (
            <RoleSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.roleIds?.message}
            />
          )}
        />

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                id="isActive"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
            )}
          />
          <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
            Pengguna aktif
          </Label>
        </div>

        {/* Change Summary */}
        {hasChanges && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <CheckCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Ada perubahan yang belum disimpan
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}
