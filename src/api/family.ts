import client from './client'
import type {
  CreateFamilyRequest, UpdateFamilyRequest, AddMemberRequest,
  UpdateMemberRoleRequest, FamilyResponse, FamilyListResponse,
  FamilyMemberResponse, MessageResponse,
} from '@/types/api'

export const familyApi = {
  create: (data: CreateFamilyRequest) =>
    client.post<FamilyResponse>('/families', data),

  list: () =>
    client.get<FamilyListResponse[]>('/families'),

  get: (id: string) =>
    client.get<FamilyResponse>(`/families/${id}`),

  update: (id: string, data: UpdateFamilyRequest) =>
    client.put<FamilyResponse>(`/families/${id}`, data),

  delete: (id: string) =>
    client.delete<MessageResponse>(`/families/${id}`),

  addMember: (familyId: string, data: AddMemberRequest) =>
    client.post<FamilyMemberResponse>(`/families/${familyId}/members`, data),

  removeMember: (familyId: string, userId: string) =>
    client.delete<MessageResponse>(`/families/${familyId}/members/${userId}`),

  leave: (familyId: string) =>
    client.delete<MessageResponse>(`/families/${familyId}/leave`),

  updateMemberRole: (familyId: string, userId: string, data: UpdateMemberRoleRequest) =>
    client.patch<MessageResponse>(`/families/${familyId}/members/${userId}/role`, data),
}
