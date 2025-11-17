import React from 'react'
import { MoreHorizontalIcon, EditIcon, KeyIcon, UserCheckIcon, UserXIcon } from 'lucide-react'
import type { Column } from '@/components/ui/data-table'
import type { User } from '@/types/user'
import {
  getUserInitials,
  getRoleColor,
  getStatusColor,
  getStatusText,
  getRoleNamesString,
  getTimeAgo,
  formatDate,
  isUserOnline
} from '../lib/utils'

// UI Components
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// User Avatar Component
interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  }

  const isOnline = isUserOnline(user.lastLoginAt)

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20`}>
        <span className="font-semibold text-primary">
          {getUserInitials(user.fullName)}
        </span>
      </div>
      {/* Online indicator */}
      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
        isOnline ? 'bg-green-500' : 'bg-gray-300'
      }`} />
    </div>
  )
}

// Role Badges Component
interface RoleBadgesProps {
  roles: User['roles']
  maxDisplay?: number
}

const RoleBadges: React.FC<RoleBadgesProps> = ({ roles, maxDisplay = 2 }) => {
  if (roles.length === 0) {
    return <Badge variant="secondary">Tidak ada role</Badge>
  }

  const displayRoles = roles.slice(0, maxDisplay)
  const remainingCount = roles.length - maxDisplay

  return (
    <div className="flex flex-wrap gap-1">
      {displayRoles.map(role => (
        <Badge
          key={role.id}
          className={`${getRoleColor(role.slug)} border`}
          variant="secondary"
        >
          {role.name}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
    </div>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  isActive: boolean
  lastLoginAt: string | null
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive, lastLoginAt }) => {
  const isOnline = isUserOnline(lastLoginAt)

  if (isOnline) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <Badge className={getStatusColor(true)}>
            Online
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge className={getStatusColor(isActive)}>
        {getStatusText(isActive)}
      </Badge>
      {lastLoginAt && (
        <span className="text-xs text-muted-foreground">
          {getTimeAgo(lastLoginAt)}
        </span>
      )}
    </div>
  )
}

/**
 * Enhanced DataTable columns for Users Management
 */
export const getUserTableColumns = (
  onEdit?: (user: User) => void,
  onResetPassword?: (user: User) => void,
  onToggleStatus?: (user: User) => void
): Column<User>[] => [
  {
    key: 'user',
    label: 'Pengguna',
    sortable: true,
    mobile: true,
    render: (value, user) => (
      <div className="flex items-center gap-3">
        <UserAvatar user={user} size="md" />
        <div className="min-w-0">
          <div className="font-semibold text-foreground truncate">
            {user.fullName}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            @{user.username}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {user.email}
          </div>
          {user.nip && (
            <div className="text-xs text-muted-foreground mt-1">
              NIP: {user.nip}
            </div>
          )}
        </div>
      </div>
    )
  },
  {
    key: 'fullName',
    label: 'Nama',
    sortable: true,
    render: (value) => (
      <span className="font-medium">{value as string}</span>
    )
  },
  {
    key: 'username',
    label: 'Username',
    sortable: true,
    render: (value) => (
      <span className="font-mono text-sm">@{value as string}</span>
    )
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    render: (value) => (
      <span className="text-muted-foreground">{value as string}</span>
    )
  },
  {
    key: 'nip',
    label: 'NIP',
    render: (value) => (
      <span className="font-mono text-sm">{value as string || '-'}</span>
    )
  },
  {
    key: 'phone',
    label: 'Telepon',
    render: (value) => (
      <span className="font-mono text-sm">{value as string || '-'}</span>
    )
  },
  {
    key: 'roles',
    label: 'Role',
    sortable: false,
    mobile: true,
    render: (value) => (
      <RoleBadges roles={value as User['roles']} maxDisplay={2} />
    )
  },
  {
    key: 'isActive',
    label: 'Status',
    sortable: true,
    mobile: true,
    render: (value, user) => (
      <StatusBadge
        isActive={value as boolean}
        lastLoginAt={user.lastLoginAt}
      />
    )
  },
  {
    key: 'lastLoginAt',
    label: 'Login Terakhir',
    sortable: true,
    render: (value) => (
      <div className="text-sm">
        {value ? (
          <div className="space-y-1">
            <div className="text-foreground">
              {formatDate(value as string)}
            </div>
            <div className="text-muted-foreground text-xs">
              {getTimeAgo(value as string)}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Belum pernah</span>
        )}
      </div>
    )
  },
  {
    key: 'createdAt',
    label: 'Tanggal Dibuat',
    sortable: true,
    render: (value) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(value as string)}
      </span>
    )
  },
  {
    key: 'actions',
    label: 'Aksi',
    render: (value, user) => (
      <div className="flex items-center gap-1">
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            className="h-8 w-8 p-0"
            title="Edit pengguna"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
        )}

        {onResetPassword && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResetPassword(user)}
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
            title="Reset password"
          >
            <KeyIcon className="h-4 w-4" />
          </Button>
        )}

        {onToggleStatus && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(user)}
            className={`h-8 w-8 p-0 ${
              user.isActive
                ? 'text-red-600 hover:text-red-700'
                : 'text-green-600 hover:text-green-700'
            }`}
            title={user.isActive ? 'Nonaktifkan pengguna' : 'Aktifkan pengguna'}
          >
            {user.isActive ? (
              <UserXIcon className="h-4 w-4" />
            ) : (
              <UserCheckIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    )
  }
]

/**
 * Mobile card renderer for DataTable
 */
export const getUserMobileCard = (user: User): React.ReactNode => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <UserAvatar user={user} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-foreground truncate">
          {user.fullName}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          @{user.username} • {user.email}
        </div>
        {user.nip && (
          <div className="text-xs text-muted-foreground mt-1">
            NIP: {user.nip}
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <span className="text-muted-foreground">Role:</span>
        <div className="mt-1">
          <RoleBadges roles={user.roles} maxDisplay={1} />
        </div>
      </div>
      <div>
        <span className="text-muted-foreground">Status:</span>
        <div className="mt-1">
          <StatusBadge
            isActive={user.isActive}
            lastLoginAt={user.lastLoginAt}
          />
        </div>
      </div>
    </div>

    {user.phone && (
      <div className="text-sm">
        <span className="text-muted-foreground">Telepon:</span>
        <span className="ml-1 font-mono">{user.phone}</span>
      </div>
    )}

    <div className="text-sm">
      <span className="text-muted-foreground">Login terakhir:</span>
      <div className="text-foreground">
        {user.lastLoginAt ? getTimeAgo(user.lastLoginAt) : 'Belum pernah'}
      </div>
    </div>
  </div>
)
