export interface MealPlanDay {
  id: string
  mealPlanId: string
  date: string
  dayCalories?: number
  dayProtein?: number
  dayFat?: number
  dayCarbs?: number
}

export interface MealPlanRecipe {
  id: string
  mealPlanDayId: string
  recipeId: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  servings: number
  sortOrder: number
  isSubstituted: boolean
  notes?: string
}

export interface MealPlan {
  id: string
  userId: string
  familyId?: string
  title: string
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'completed' | 'archived'
  totalEstimatedCost?: number
  preferencesSnapshot?: any
  gptRequestId?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  days?: MealPlanDay[]
  recipes?: MealPlanRecipe[]
}

export interface GenerateMealPlanRequest {
  startDate: string
  endDate: string
  familyId?: string
}

export interface UpdateMealPlanRequest {
  title?: string
  status?: string
}

export interface TaskStatus {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  error?: string
}
