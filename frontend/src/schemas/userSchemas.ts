import { z } from 'zod'

// Schema for creating a new user
// Based on the task requirements with Indonesian error messages
export const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Hanya alfanumerik dan underscore'),

  email: z.string().email('Email tidak valid'),

  fullName: z.string().min(3, 'Nama minimal 3 karakter'),

  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password harus kombinasi huruf besar, kecil, dan angka'),

  password_confirmation: z.string(),

  nip: z.string().length(18, 'NIP harus 18 digit').optional().or(z.literal('')),

  phone: z.string()
    .regex(/^08\d{8,11}$/, 'Format: 08xxxxxxxxxx')
    .optional().or(z.literal('')),

  roleIds: z.array(z.string()).min(1, 'Pilih minimal 1 role'),

  isActive: z.boolean()
}).refine(data => data.password === data.password_confirmation, {
  message: "Password tidak cocok",
  path: ["password_confirmation"]
})

// Schema for editing existing user
// Password is optional for edit, no confirmation needed
export const editUserSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Hanya alfanumerik dan underscore'),

  email: z.string().email('Email tidak valid'),

  fullName: z.string().min(3, 'Nama minimal 3 karakter'),

  nip: z.string().length(18, 'NIP harus 18 digit').optional().or(z.literal('')),

  phone: z.string()
    .regex(/^08\d{8,11}$/, 'Format: 08xxxxxxxxxx')
    .optional().or(z.literal('')),

  roleIds: z.array(z.string()).min(1, 'Pilih minimal 1 role'),

  isActive: z.boolean()
})

// Schema for resetting password
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password harus kombinasi huruf besar, kecil, dan angka'),

  password_confirmation: z.string()
}).refine(data => data.password === data.password_confirmation, {
  message: "Password tidak cocok",
  path: ["password_confirmation"]
})
