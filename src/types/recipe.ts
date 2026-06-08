export interface Ingredient {
  id: string
  name: string
  category: 'vegetables' | 'fruits' | 'meat' | 'dairy' | 'grains' | 'spices' | 'other'
  caloriesPer100g: number
  proteinPer100g: number
  fatPer100g: number
  carbsPer100g: number
  defaultUnit: string
  avgPricePerUnit?: number
  isAllergen: boolean
  allergenType?: string
  createdAt: string
  updatedAt: string
}

export interface RecipeIngredient {
  id: string
  recipeId: string
  ingredientId: string
  amount: number
  unit: string
  isOptional: boolean
  notes?: string
  ingredient?: Ingredient
}

export interface Recipe {
  id: string
  userId?: string
  title: string
  description?: string
  instructions: string
  cookingTimeMin?: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine?: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  imageUrl?: string
  isApproved: boolean
  isAiGenerated: boolean
  source: 'manual' | 'gpt' | 'imported'
  createdAt: string
  updatedAt: string
  deletedAt?: string
  ingredients?: RecipeIngredient[]
}

export interface CreateRecipeRequest {
  title: string
  description?: string
  instructions: string
  cookingTimeMin?: number
  servings?: number
  difficulty?: string
  cuisine?: string
  mealType: string
  ingredients: {
    ingredientId: string
    amount: number
    unit: string
    isOptional?: boolean
    notes?: string
  }[]
}

export interface UpdateRecipeRequest {
  title?: string
  description?: string
  instructions?: string
  cookingTimeMin?: number
  servings?: number
  difficulty?: string
  cuisine?: string
  mealType?: string
  ingredients?: {
    ingredientId: string
    amount: number
    unit: string
    isOptional?: boolean
    notes?: string
  }[]
}
