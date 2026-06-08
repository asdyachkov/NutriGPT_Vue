import client from './client'
import type { UpdateProfileRequest, ProfileResponse } from '@/types/api'

export const profileApi = {
  get: () =>
    client.get<ProfileResponse>('/profile'),

  update: (data: UpdateProfileRequest) =>
    client.put<ProfileResponse>('/profile', data),
}
