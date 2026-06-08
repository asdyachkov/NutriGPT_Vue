export interface Profile {
  id: string
  userId: string
  gender?: 'male' | 'female'
  birthDate?: string
  heightCm?: number
  weightKg?: number
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal?: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle'
  bmr?: number
  tdee?: number
  targetCalories?: number
  targetProtein?: number
  targetFat?: number
  targetCarbs?: number
  dietaryRestrictions?: string[]
  allergies?: string[]
  cuisinePreferences?: string[]
  createdAt: string
  updatedAt: string
}

export interface NutritionTargets {
  bmr: number
  tdee: number
  targetCalories: number
  targetProtein: number
  targetFat: number
  targetCarbs: number
}

export interface ProfileUpdateRequest {
  gender?: string
  birthDate?: string
  heightCm?: number
  weightKg?: number
  activityLevel?: string
  goal?: string
  dietaryRestrictions?: string[]
  allergies?: string[]
  cuisinePreferences?: string[]
}
