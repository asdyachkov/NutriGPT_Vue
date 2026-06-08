export interface Family {
  id: string
  name: string
  adminUserId: string
  monthlyBudget?: number
  createdAt: string
  updatedAt: string
}

export interface FamilyMember {
  id: string
  familyId: string
  userId: string
  role: 'admin' | 'member'
  joinedAt: string
}

export interface FamilyCreateRequest {
  name: string
  monthlyBudget?: number
}

export interface FamilyUpdateRequest {
  name?: string
  monthlyBudget?: number
}

export interface AddFamilyMemberRequest {
  userEmail: string
  role?: 'admin' | 'member'
}
