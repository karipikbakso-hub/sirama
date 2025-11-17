'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon, KeyIcon } from 'lucide-react'
import { resetPasswordSchema } from '@/schemas/userSchemas'
import type { ResetPasswordFormData, User } from '@/types/user'
import { getUserInitials } from '../lib/utils'
import { toast } from '@/lib/toast'

// UI Components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormField } from '@/components/ui/modal-form'
import { Badge } from '@/components/ui/badge'

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

// User Summary Card
interface UserSummaryProps {
  user: User
}

const UserSummary: React.FC<UserSummaryProps> = ({ user }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20">
        <span className="font-semibold text-primary text-lg">
          {getUserInitials(user.fullName)}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground">
          {user.fullName}
        </h3>
        <p className="text-sm text-muted-foreground">
          @{user.username} • {user.email}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
          {user.roles.length > 0 && (
            <Badge variant="outline">
              {user.roles[0].name}
              {user.roles.length > 1 && ` +${user.roles.length - 1}`}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

interface ResetPasswordFormProps {
  user: User
  onSuccess: () => void
  onCancel?: () => void
}

export function ResetPasswordForm({ user, onSuccess, onCancel }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      password_confirmation: ''
    }
  })

  const password = watch('password')
  const passwordConfirmation = watch('password_confirmation')

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await fetch(`/api/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to reset password')
      }

      const result = await response.json()
      toast.success(result.message || 'Password berhasil direset!')

      // Call onSuccess to close modal
      onSuccess()
    } catch (error: any) {
      console.error('Reset password error:', error)
      toast.error(error.message || 'Gagal mereset password')
    }
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <AlertTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Reset Password Pengguna
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Tindakan ini akan mengubah password pengguna secara permanen. Pastikan untuk memberitahu pengguna tentang password baru ini.
          </p>
        </div>
      </div>

      {/* User Summary */}
      <UserSummary user={user} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Password Baru"
            required
            error={errors.password?.message}
          >
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Minimal 8 karakter"
                autoFocus
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
            label="Konfirmasi Password Baru"
            required
            error={errors.password_confirmation?.message}
          >
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('password_confirmation')}
                placeholder="Ulangi password baru"
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

        {/* Password Strength Indicator */}
        <PasswordStrength password={password} />

        {/* Password Match Indicator */}
        <div className="flex items-center gap-2 text-sm">
          {password && passwordConfirmation ? (
            password === passwordConfirmation ? (
              <>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Password cocok</span>
              </>
            ) : (
              <>
                <XCircleIcon className="h-4 w-4 text-red-500" />
                <span className="text-red-500">Password tidak cocok</span>
              </>
            )
          ) : null}
        </div>

        {/* Security Tips */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Tips Keamanan Password:
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Minimal 8 karakter</li>
            <li>• Kombinasi huruf besar, kecil, dan angka</li>
            <li>• Gunakan simbol untuk keamanan ekstra</li>
            <li>• Jangan gunakan informasi pribadi</li>
          </ul>
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
            disabled={isSubmitting || !password || password !== passwordConfirmation}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg disabled:opacity-50 transition-colors font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <KeyIcon className="h-4 w-4 animate-pulse" />
                Mereset Password...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <KeyIcon className="h-4 w-4" />
                Reset Password
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
