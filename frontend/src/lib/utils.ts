// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ✅ Fungsi utilitas: capitalize string
export function capitalize(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ✅ Opsional: versi khusus untuk kebab-case (e.g., "perawat-poli" → "Perawat Poli")
export function kebabToTitle(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Tetap pertahankan cn() untuk Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}