import { useState } from 'react'
import { UserProfile } from './types'
import { dummyProfile } from './data'

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(dummyProfile)
  const update = (data: UserProfile) => setProfile(data)
  return { profile, update }
}
