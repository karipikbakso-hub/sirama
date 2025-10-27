export interface LoginPayload {
  username: string
  password: string
}

export interface AuthResponse {
  success: boolean
  role?: 'admin' | 'kasir'
  token?: string
  message?: string
}
