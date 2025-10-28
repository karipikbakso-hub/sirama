export function getCurrentUserRole(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sirama-role') || null
  }
  return null
}