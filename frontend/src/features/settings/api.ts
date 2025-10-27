import { UserProfile } from './types'

export async function fetchProfile(): Promise<UserProfile> {
  return new Promise(resolve => setTimeout(() => resolve(dummyProfile), 500))
}

export async function updateProfile(data: UserProfile): Promise<boolean> {
  console.log('Update profile:', data)
  return new Promise(resolve => setTimeout(() => resolve(true), 500))
}
