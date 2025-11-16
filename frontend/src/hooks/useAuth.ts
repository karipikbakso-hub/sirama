import { useAuthStore } from '@/store/auth'

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, fetchUser } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    fetchUser,
    hasRole: (role: string) => user?.roles?.includes(role) || false,
    hasPermission: (permission: string) => user?.permissions?.includes(permission) || false,
  }
}
