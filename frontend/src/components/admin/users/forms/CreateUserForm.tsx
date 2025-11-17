'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { createUserSchema } from '@/schemas/userSchemas'
import type { CreateUserFormData, Role } from '@/types/user'
import { getStatusColor, generateDefaultPassword } from '../lib/utils'
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

// Password Strength Indicator
interface PasswordStrengthProps {
  password: string
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const getStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: 'Kosong', color: 'text-muted-foreground' }

    let score = 0
    const checks = [
      pwd.length >= 8,
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[^a-zA-Z\d]/.test(pwd)
    ]

    score = checks.filter(Boolean).length

    if (score <= 2) return { score, label: 'Lemah', color: 'text-red-500' }
    if (score <= 3) return { score, label: 'Sedang', color: 'text-orange-500' }
    if (score <= 4) return { score, label: 'Kuat', color: 'text-yellow-500' }
    return { score: 5, label: 'Sangat Kuat', color: 'text-green-500' }
  }

  const strength = getStrength(password)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Kekuatan Password:</span>
        <span className={`font-medium ${strength.color}`}>{strength.label}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-colors ${
              level <= strength.score
                ? strength.score <= 2 ? 'bg-red-500' :
                  strength.score <= 3 ? 'bg-orange-500' :
                  strength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

interface CreateUserFormProps {
  onSuccess: () => void
  onCancel?: () => void
}

export function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: generateDefaultPassword(),
      password_confirmation: generateDefaultPassword(),
      nip: '',
      phone: '',
      roleIds: [],
      isActive: true
    }
  })

  const password = watch('password')

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      // For now, just show success and call onSuccess
      // In real implementation, this would call the API
      console.log('Creating user:', data)

      toast.success('Pengguna berhasil dibuat!')

      // Small delay to show success animation
      setTimeout(() => {
        onSuccess()
      }, 500)
    } catch (error) {
      console.error('Create user error:', error)
      toast.error('Gagal membuat pengguna')
    }
  }

  const fillDemoData = () => {
    setValue('username', 'demo.user')
    setValue('email', 'demo@sirama.com')
    setValue('fullName', 'Demo User Baru')
    setValue('nip', '123456789012345678')
    setValue('phone', '081234567890')
    setValue('roleIds', ['4']) // Perawat role
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header with auto-fill button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">
          Tambah Pengguna Baru
        </h2>
        <button
          type="button"
          onClick={fillDemoData}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Isi Demo Data
        </button>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Username"
          required
          error={errors.username?.message}
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

      {/* Password Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Password"
            required
            error={errors.password?.message}
          >
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          <FormField
            label="Konfirmasi Password"
            required
            error={errors.password_confirmation?.message}
          >
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('password_confirmation')}
                placeholder="Ulangi password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
        </div>

        {/* Password strength indicator */}
        <PasswordStrength password={password} />

        {/* Password match indicator */}
        <div className="flex items-center gap-2 text-sm">
          {password === watch('password_confirmation') && password ? (
            <>
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Password cocok</span>
            </>
          ) : watch('password_confirmation') && password !== watch('password_confirmation') ? (
            <>
              <XCircleIcon className="h-4 w-4 text-red-500" />
              <span className="text-red-500">Password tidak cocok</span>
            </>
          ) : null}
        </div>
      </div>

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
          Aktifkan pengguna setelah dibuat
        </Label>
      </div>

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
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
        >
          {isSubmitting ? 'Membuat Pengguna...' : 'Buat Pengguna'}
        </button>
      </div>
    </form>
  )
}
